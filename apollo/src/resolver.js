// import { inspect } from 'util'
import mongoose from 'mongoose'
import { isArray } from './helpers/index.js'
import { logger } from './lib/index.js'

import { inspect } from 'util'

const { Types } = mongoose
const { ObjectId } = Types

const getFilterFromParent = (parent, type) => {
  let filter = parent[type]

  if (Array.isArray(filter)) {
    filter = {
      _id: { $in: filter.map(k => ObjectId(k)) }
    }
  } else {
    if (filter.id) {
      filter._id = ObjectId(filter.id)

      delete filter.id
    }
  }
  return filter
}

const getFilterFromArgs = (args) => {
  let filter = args.input

  if (filter.id) {
    filter._id = ObjectId(filter.id)

    delete filter.id
  }

  return filter
}

const resolver = async (parent, args, context, info) => {
  const operation = info.operation.operation 
  const { returnType, fieldName } = info
  const collection = returnType.toString().replace(/[[|\]|!]/g, '').toLowerCase()
  let outputMessage

  // console.log(inspect(info, {depth:5, colors:true}))
  
  console.log('###################################')
  
  // console.log('COLLECTION:', collection)
  // console.log('ARGS:', args)
  
  // console.log('RETURN_TYPE:', returnType)
  // console.log('FIELD_NAME:', fieldName)
  // console.log(info.fieldNodes[0].selectionSet.selections)
  // console.log('FILTER:', filter)
  // console.log('OPERATION:', operation)
  // console.log('PARENT:', parent)
  // console.log(1111, fieldName)

  const filter = parent ? getFilterFromParent(parent, fieldName) : 
    operation === 'query' ? getFilterFromArgs(args) : {}
  
  switch(operation) {
    case 'query':
      if (isArray(returnType)) {
        console.log(filter)
        
        outputMessage = await mongoose.connection.db.collection(collection).find(filter).toArray()
        outputMessage = outputMessage.map(m => ({...m, id: m._id.toString()}))
      } else {
        outputMessage = await mongoose.connection.db.collection(collection).findOne(filter)
        outputMessage.id = outputMessage._id.toString()
      }
      break
    case 'mutation':
      if (args.input && args.input.id && Object.keys(args.input).length === 1) {
        console.log('DELETE')
      } else {
        if (args.input && !args.input.id && Object.keys(args.input).length) {
          console.log('CREATE')
      
          outputMessage = await mongoose.connection.db.collection(collection).insertOne(args.input)
          outputMessage = outputMessage.ops[0]
            
          outputMessage.id = outputMessage._id.toString()
          delete outputMessage._id
        } else {
          if (args.input && args.input.id && Object.keys(args.input).length > 1) {
            console.log('UPDATE')
          }
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