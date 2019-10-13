// import ObjectId from 'objectid'
import { mongo, amqp } from './lib/index.js'
import mongodb from 'mongodb'
// import { inspect } from 'util'
import { isArray } from './helpers/index.js'
import { typeDefs } from './schema.js'
const { ObjectID } = mongodb

const { AMQP_MQTT_LISTENER_QUEUE } = process.env

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

const getFilterFromArgs = (args) => {
  if (!args.input) {
    return {}
  }
  let filter = args.input

  if (filter.id) {
    filter._id = ObjectID(filter.id)

    delete filter.id
  }

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

const getFieldType = (type, fieldName) => {
  const typeDefType = /Input/.test(type) ? 'input' : 'output'
  if (type !== 'Query' && type !== 'Mutation') {
    const parentFields = typeDefs[typeDefType].find(t => t.name === type).fields
    const fieldType = parentFields[fieldName] ? parentFields[fieldName] : false

    return fieldType
  }

  return false
}

const makeData = (data, returnType, parentType, fieldName) => {
  const typeDefType = /Input/.test(returnType) ? 'input' : 'output'
  
  
  if (parentType !== 'Mutation') {
    data = data[fieldName]
  }

  const collection = returnType.replace(/[[|\]|!]/g, '')
  const fields = typeDefs[typeDefType].find(t => t.name === collection).fields
  
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
  const device = await client.collection('Device').findOne({
    sensors: {
      $elemMatch: {
        $eq: sensor._id
      }
    }
  })

  const message = {
    info: {
      operation: 'set-value',
      // source: 'apollo',
    },
    input: {
      device: {
        _id: device._id,
        name: device.name,
        sensor: {
          type: sensor.type,
          value,
        }
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
      console.log('GET')
      // eslint-disable-next-line
      const filter = parent ? getFilterFromParent(parent, fieldName) : 
        operation === 'query' ? getFilterFromArgs(args) : {}

      if (filter !== null) {
        outputMessage = await client.collection(collection).find(filter).toArray()
        outputMessage = outputMessage.map(renameId)
      } else {
        outputMessage = [null]
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

      console.log('UPSERT')
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

      if (!isArray(returnType)) {
        outputMessage = outputMessage[0]
      }
      break
    default:
      outputMessage = Error('Unknown operation')
      break
  }

  return outputMessage
}

export default resolver