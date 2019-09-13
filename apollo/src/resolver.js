// import { inspect } from 'util'
import mongoose from 'mongoose'
import { isArray } from './helpers/index.js'
import { logger } from './lib/index.js'

import { inspect } from 'util'



import { typeDefs } from './schema.js'


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


const makeData = (data, returnType) => {
  const fields = typeDefs.output.find(t => t.name === returnType.toString()).fields

  

  Object.keys(fields).forEach(key => {
    const type = fields[key].replace(/[[|\]|!]/g, '')
    console.log('FIELD TYPE', type)
    
    if (!(key in data) && type !== 'Int' && type !== 'Boolean' && type !== 'String') {
      delete data[key]
    }
  })

  return data
}

const resolver = async (parent, args, context, info) => {
  const operation = info.operation.operation 
  const { returnType, fieldName, parentType } = info
  const collection = returnType.toString().replace(/[[|\]|!]/g, '')
  // const parentCollection = parentType.toString().replace(/[[|\]|!]/g, '')
  let outputMessage

  context.args = Object.keys(args).length ? args : context.args 

 
  
  console.log('\n\n###################################')
  // console.log(inspect(info.fieldNodes[0].selectionSet.selections, {depth:5, colors:true}))  
  // console.log(inspect(info, {depth:10, colors:true}))  
  // console.log('COLLECTION:', collection)
  // console.log('ARGS:', args)
  console.log('RETURN_TYPE:', returnType)
  // console.log('FIELD_NAME:', fieldName)
  // console.log(info.fieldNodes[0].selectionSet.selections)
  // console.log('FILTER:', filter)
  // console.log('OPERATION:', operation)
  // console.log('PARENT:', parent)
  // console.log('PARENT_TYPE:', parentType)
  // console.log('CONTEXT:', context)
  
  
  


  switch(operation) {
    case 'query':
      // eslint-disable-next-line
      const filter = parent ? getFilterFromParent(parent, fieldName) : 
        operation === 'query' ? getFilterFromArgs(args) : {}

      if (isArray(returnType)) {
        outputMessage = await mongoose.connection.db.collection(collection).find(filter).toArray()
        outputMessage = outputMessage.map(m => ({...m, id: m._id.toString()}))
      } else {
        outputMessage = await mongoose.connection.db.collection(collection).findOne(filter)
        outputMessage.id = outputMessage._id.toString()
      }
      break
    case 'mutation':
      if (context.args.input && !context.args.input.id && Object.keys(context.args.input).length) {
        console.log('CREATE')


        // console.log('ARGS:', args)
        
        const data = makeData(context.args.input, returnType)
        console.log('DATA:', data)
      
        outputMessage = await mongoose.connection.db.collection(collection).insertMany(data)
        outputMessage = outputMessage.ops

        // let data = JSON.parse(JSON.stringify(context.args.input))

        // if (parentType !== 'Mutation' && parent) {
        //   data = data[fieldName]
        // }

        // if (Array.isArray(data)) {
        //   data = data.map(d =>{
        //     Object.keys(d).forEach(k => {
        //       if (info.fieldNodes[0].selectionSet.selections.find(f => f.name.value === k && f.selectionSet)) {
        //         delete d[k]
        //       }
        //     })
        //     return d
        //   })
        // } else {
        //   Object.keys(data).forEach(k => {
        //     if (info.fieldNodes[0].selectionSet.selections.find(f => f.name.value === k && f.selectionSet)) {
        //       delete data[k]
        //     }
        //   })
        // }

        // if (Array.isArray(data)) {
        // outputMessage = await mongoose.connection.db.collection(collection).insertMany(data)
        // outputMessage = outputMessage.ops
        // } else {
        //   outputMessage = await mongoose.connection.db.collection(collection).insertOne(data)
        //   outputMessage = outputMessage.ops[0]
        // }

        // if (parent && parentCollection !== 'Mutation') {
        //   await mongoose.connection.db.collection(parentCollection).update({
        //     _id: ObjectId(context.parent.id)
        //   }, {
        //     $push: {
        //       [fieldName]: {
        //         $each: isArray(returnType) ? outputMessage.map(o => o._id) : outputMessage._id
        //       }
        //     }
        //   })

        //   await mongoose.connection.db.collection(collection).updateMany({
        //     _id: {
        //       $in: Array.isArray(outputMessage) ? outputMessage.map(k => k._id) : [ outputMessage._id ]
        //     }
        //   }, {
        //     $set: { [parentCollection.toLowerCase()]: ObjectId(context.parent.id) }
        //   })
        // }

        // outputMessage = Array.isArray(outputMessage)
        //   ? outputMessage.map(p => ({ ...p, id: p._id.toString() }))
        //   : { ...outputMessage, id: outputMessage._id.toString() }

        // context.parent = outputMessage
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