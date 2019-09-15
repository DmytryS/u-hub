// import { inspect } from 'util'
import mongoose from 'mongoose'
import { isArray } from './helpers/index.js'
import { typeDefs } from './schema.js'

const { Types } = mongoose
const { ObjectId } = Types

const makeObjectId = (id) => ObjectId.isValid(id) && typeof id !== 'string' ? id : ObjectId(id)

const getFilterFromParent = (parent, field) => {
  let filter = parent[field]

  if (Array.isArray(filter)) {
    filter = {
      _id: { $in: filter.map(makeObjectId) }
    }
  } else {
    if (ObjectId.isValid(filter)) {
      filter = { _id: filter }
    } else {
      if (filter.id) {
        filter._id = makeObjectId(filter.id)
  
        delete filter.id
      }
    }    
  }

  return filter
}

const getFilterFromArgs = (args) => {
  if (!args.input) {
    return {}
  }
  let filter = args.input

  if (filter.id) {
    filter._id = ObjectId(filter.id)

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
        d[key] = ObjectId(d[key])
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

    await mongoose.connection.db.collection(parentCollection).updateOne(
      {
        _id: makeObjectId(parent.id)
      },
      parentDataUpdate
    )

    await mongoose.connection.db.collection(collection).updateMany({
      _id: {
        $in: data.map(k => makeObjectId(k.id))
      }
    }, {
      $set: { [`${parentCollection.charAt(0).toLowerCase()}${parentCollection.slice(1)}`]: makeObjectId(parent.id) }
    })
  }
}

const makeInputType = type => type !== 'Mutation'
  ? isArray(type) ? `[${type.replace(/[[|\]|!]/g, '')}Input]` : `${type.replace(/[[|\]|!]/g, '')}Input`
  : type

const resolver = async (parent, args, context, info) => {
  const operation = info.operation.operation 
  let { returnType, fieldName, parentType } = info
  returnType = returnType.toString().replace(/!/g, '')
  parentType = parentType.toString()
  const collection = returnType.replace(/[[|\]|!]/g, '')
  const parentCollection = parentType.replace(/[[|\]|!]/g, '')
  let outputMessage
  
  context.args = !context.args && Object.keys(args).length ? args : context.args 

  switch(operation) {
    case 'query':
      console.log('GET')
      // eslint-disable-next-line
      const filter = parent ? getFilterFromParent(parent, fieldName) : 
        operation === 'query' ? getFilterFromArgs(args) : {}

      outputMessage = await mongoose.connection.db.collection(collection).find(filter).toArray()
      outputMessage = outputMessage.map(renameId)
      
      if (!isArray(returnType)) {
        outputMessage = outputMessage[0]
      }
      break
    case 'mutation':
      if (context.args.input && !context.args.input.id && Object.keys(context.args.input).length) {
        console.log('CREATE')
        const parentFieldType = getFieldType(makeInputType(parentType), fieldName)

        if (parentFieldType && parentFieldType.replace(/\[|\]|!/g, '') === 'ID') {
          
          outputMessage = await mongoose.connection.db.collection(collection).find(getFilterFromParent(parent, fieldName)).toArray()
          outputMessage = outputMessage.map(renameId)
        } else {
          const data = makeData(
            JSON.parse(JSON.stringify(context.args.input)),
            makeInputType(returnType),
            makeInputType(parentType),
            fieldName,
            operation
          )
  
          outputMessage = await mongoose.connection.db.collection(collection).insertMany(data)
          outputMessage = outputMessage.ops
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
      } else {
        if (context.args.input && context.args.input.id && Object.keys(context.args.input).length > 1) {
          console.log('UPDATE')
        }
      }
      break
    default:
      outputMessage = Error('Unknown operation')
      break
  }

  return outputMessage
}

export default resolver