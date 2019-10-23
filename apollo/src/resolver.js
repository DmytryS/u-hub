// import ObjectId from 'objectid'
// import apolloServer from 'apollo-server'
import { mongo, amqp } from './lib/index.js'
import mongodb from 'mongodb'
// import { inspect } from 'util'
import { isArray } from './helpers/index.js'
import { typeDefs } from './schema.js'


const { ObjectID } = mongodb

const {
  AMQP_MQTT_LISTENER_QUEUE,
  AMQP_SCHEDULED_ACTION_QUEUE,
} = process.env

const makeObjectId = (id) => ObjectID.isValid(id) && typeof id !== 'string' ? id : ObjectID(id)

const getFilterFromParent = (parent, field) => {
  let filter = parent[field]

  if(filter) {
    if (Array.isArray(filter)) {
      filter = {
        _id: { $in: filter.map(makeObjectId) }
      }
    } else {
      if (ObjectID.isValid(filter)) {
        filter = { _id: makeObjectId(filter) }
      } else {
        if (filter.id) {
          filter._id = makeObjectId(filter.id)
    
          delete filter.id
        }
      }
    }
  } else {
    filter = null
  }

  return filter
}

const isDate = (date) => {
  const regExp = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$')
  return regExp.test(date)
}

const transformFilter = (filter) => {
  const operators = ['in', 'eq', 'gt', 'gte', 'lt', 'lte', 'ne']

  switch(typeof filter) {
    case 'string':
      if (isDate(filter)) {
        filter = new Date(filter)
      }
      break
    case 'object':
      Object.keys(filter).forEach(key => {
        let newKey = key
        if (operators.includes(key)) {
          newKey = `$${key}`

          filter[newKey] = filter[key]
      
          delete filter[key]
        }
      
        filter[newKey] = transformFilter(filter[newKey])
      })
      break
  }

  return filter
}

const getFilterFromArgs = (args) => {
  let filter = {}
  if (args.filter) {
    filter = transformFilter(args.filter)
  } else {
    if (args.input) {
      filter = args.input
    }
  }

  if (Object.keys(filter).length === 0){
    return filter
  }

  if (filter.id) {
    filter._id = filter.id // ObjectID

    delete filter.id
  }

  Object.keys(filter).forEach(key => {
    if (typeof filter[key] === 'string' && ObjectID.isValid(filter[key])) {
      filter[key] = ObjectID(filter[key])
    }
  })

  return filter
}

const deleteFields = (data, fields) => {
  const outputData = data
  
  Object.keys(fields).forEach(key => {
    const type = fields[key].replace(/[[|\]|!]/g, '')
    if (type !== 'Int' && type !== 'Boolean' && type !== 'String' && type !== 'ID') {
      delete outputData[key]
    }
  })
  return outputData
}

const getFieldName = (type, fieldType) => {
  const typeDefType = /Input/.test(type) ? 'input' : 'output'
  if (type !== 'Query' && type !== 'Mutation') {
    const parentFields = typeDefs[typeDefType].find(t => t.name === type).fields
    const field = Object.keys(parentFields).find(key => parentFields[key] === fieldType)

    return field
  }

  return false
}

const getTypeFields = (type) => {
  const typeDefType = /Input/.test(type) ? 'input' : 'output'
  if (type !== 'Query' && type !== 'Mutation') {
    const fields = typeDefs[typeDefType].find(t => t.name === type).fields

    return fields
  }

  return false
}

const getFieldType = (type, fieldName) => {
  // const typeDefType = /Input/.test(type) ? 'input' : 'output'
  if (type !== 'Query' && type !== 'Mutation') {
    const parentFields = getTypeFields(type)// typeDefs[typeDefType].find(t => t.name === type).fields
    const fieldType = parentFields && parentFields[fieldName] ? parentFields[fieldName] : false

    return fieldType
  }

  return false
}

const makeData = (data, returnType, parentType, fieldName) => {
  // const typeDefType = /Input/.test(returnType) ? 'input' : 'output'

  if (parentType !== 'Mutation') {
    data = data[fieldName]
  }

  const collection = returnType.replace(/[[|\]|!]/g, '')
  const fields = getTypeFields(collection)// typeDefs[typeDefType].find(t => t.name === collection).fields
  
  let outputData

  if (Array.isArray(data)) {
    outputData = data.map(k => deleteFields(k, fields))
  } else {
    outputData = [ deleteFields(data, fields) ]
  }

  outputData.map(d => {
    for (const key in d) {
      if (fields[key] === 'ID') {
        d[key] = ObjectID(d[key])
      }
    }

    if (fields.createdAt && fields.createdAt === 'Date') {
      d.createdAt = Date.now()
      // d.updatedAt = Date.now()
    }
  })

  return outputData
}

const renameId = (entity) => {
  const formatedData = {
    id: entity._id.toString(),
    ...entity,
  }
  delete formatedData._id

  return formatedData
}

const makeReferences = async (data, parent, collection, parentCollection, fieldName, returnType, parentType) => {
  const client = mongo.connection()

  if (parentCollection !== 'Query' && parentCollection !== 'Mutation') {
    const parentFieldName = getFieldName(parentType, returnType)
    let parentDataUpdate

    if (isArray(returnType)) {
      parentDataUpdate = {
        $push: {
          [parentFieldName]: {
            $each: data.map(k => makeObjectId(k.id))
          }
        },
      }
    } else {
      parentDataUpdate = {
        $set: { [parentFieldName]: makeObjectId(data[0].id) }
      }
    }

    await client.collection(parentCollection).updateOne(
      {
        _id: makeObjectId(parent.id)
      },
      parentDataUpdate
    )

    await client.collection(collection).updateMany({
      _id: {
        $in: data.map(k => makeObjectId(k.id))
      }
    }, {
      $set: { [`${parentCollection.charAt(0).toLowerCase()}${parentCollection.slice(1)}`]: makeObjectId(parent.id) }
    })
  }
}

const isRoot = (type) => type === 'Mutation' || type === 'Query'

const makeInputType = type => type !== 'Mutation'
  ? isArray(type) ? `[${type.replace(/[[|\]|!]/g, '')}Input]` : `${type.replace(/[[|\]|!]/g, '')}Input`
  : type

const sendNewValueToDevice = async (sensorId, value) => {
  const client = mongo.connection()

  const sensor = await client.collection('Sensor').findOne({
    _id: makeObjectId(sensorId)
  })

  if (!sensor.mqttSetTopic) {
    return {
      sensor: sensor._id.toString(),
      value: -1,
    }
  }

  const message = {
    info: {
      operation: 'set-value',
    },
    input: {
      sensor: {
        _id: sensor._id,
        mqttSetTopic: sensor.mqttSetTopic,
        type: sensor.type,
        value,
      }
    }
  }

  await amqp.publish(
    AMQP_MQTT_LISTENER_QUEUE,
    message
  )

  return {
    sensor: sensor._id.toString(),
    value,
  }
}

const reinitializeScheduledJobs = async () => {
  await amqp.publish(
    AMQP_SCHEDULED_ACTION_QUEUE,
    {
      info: {
        operation: 'reinitialize-jobs'
      }
    }
  )
}

const resolver = async (parent, args, context, info) => {
  const client = mongo.connection()
  let { returnType, fieldName, parentType } = info
  returnType = returnType.toString().replace(/!/g, '')
  parentType = parentType.toString()
  const collection = returnType.replace(/[[|\]|!]/g, '')
  const parentCollection = parentType.replace(/[[|\]|!]/g, '')
  let outputMessage
  
  context.args = !context.args && Object.keys(args).length ? args : context.args 

  const operation = info.operation.operation === 'mutation' &&  context.args && (isRoot(parentType) || context.args.input[fieldName]) ? 'mutation' : 'query'

  switch(operation) {
    case 'query':
      // eslint-disable-next-line
      let filter = null
      if (parent) {
        filter = getFilterFromParent(parent, fieldName)
      } else {
        filter = getFilterFromArgs(args)
      }

      if (filter !== null) {
        filter.deleted = { $ne: true }
        outputMessage = await client.collection(collection).find(filter).toArray()
        outputMessage = outputMessage.map(renameId)
      } else {
        outputMessage = []
      }
      
      if (!isArray(returnType)) {
        outputMessage = outputMessage[0]
      }
      break
    case 'mutation':
      if (isRoot(parentType) && collection === 'Value') {
        const val = await sendNewValueToDevice(context.args.input.sensor, context.args.input.value)
        return val
      }

      // eslint-disable-next-line
      const parentFieldType = getFieldType(makeInputType(parentType), fieldName)

      if (parentFieldType && parentFieldType.replace(/\[|\]|!/g, '') === 'ID') {
        outputMessage = await client.collection(collection).find(getFilterFromParent(parent, fieldName)).toArray()
        outputMessage = outputMessage.map(renameId)
      } else {
        let data = makeData(
          JSON.parse(JSON.stringify(context.args.input)),
          makeInputType(returnType),
          makeInputType(parentType),
          fieldName,
          operation
        )

        data = data.map(d => {
          const t = {
            _id: d.id ? d.id : new ObjectID(),
            ...d
          }

          delete t.id

          return t
        })

        outputMessage = await Promise.all(data.map(d => client.collection(collection).findOneAndUpdate({
          _id: d._id
        },
        {
          $set: d
        },
        {
          upsert: true,
          // setDefaultsOnInsert: true,
          returnNewDocument: true,
          returnOriginal: false,
        }).then(res => res.value)))

        outputMessage = outputMessage.map(renameId)

        await makeReferences(
          outputMessage,
          parent,
          collection,
          parentCollection,
          fieldName,
          makeInputType(returnType),
          makeInputType(parentType),
        )
      }

      if (isRoot(parentType) && collection === 'ScheduledAction') {
        await reinitializeScheduledJobs()
      }

      if (!isArray(returnType)) {
        outputMessage = outputMessage[0]
      }

      context.pubsub.publish(fieldName, { [fieldName]: JSON.parse(JSON.stringify(outputMessage)) })
      break
    default:
      outputMessage = Error('Unknown operation')
      break
  }

  return outputMessage
}

export default resolver
