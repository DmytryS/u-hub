import { Sensor } from '../models/index.js'
import mongoose from 'mongoose'
import { isArray } from '../helpers/index.js'

const { Types } = mongoose
const { ObjectId } = Types

const query = async (parent, args, context, info) => {
  let sensor
  if (isArray(info.returnType)) {
    sensor = await Sensor.find({
      '_id': { $in: parent.sensors.map(s => ObjectId(s)) }
    })

  } else {
    sensor = await Sensor.findById(parent.sensor)
  }

  return sensor
}

const mutation = (parent, args, context, info) => {
  console.log('SENSOR MUTATION')
}

export default {
  query,
  mutation
}