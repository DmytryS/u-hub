import { Device, Sensor } from '../models/index.js'
import { isArray } from '../helpers/index.js'
import mongoose from 'mongoose'

const { Types } = mongoose
const { ObjectId } = Types

const query = async (parent, args, context, info) => {
  let device
  const filterParams = args.input
  if (args.input && args.input.id) {
    delete filterParams.id
    filterParams._id = ObjectId(filterParams.id)
  }

  console.log(111, filterParams)
  
  if (isArray(info.returnType)) {
    device = await Device.find(filterParams)
  } else {
    device = await Device.findOne(filterParams)
  }

  console.log(device)
  

  return device
}

const mutation = async (parent, args, context, info) => {
  let device
  let sensors

  if (args.input && args.input.id && Object.keys(args.input).length === 1) {
    console.log('DELETE')
  }
  if (args.input && !args.input.id && Object.keys(args.input).length) {
    console.log('CREATE')
    if (args.input.sensors) {
      sensors = args.input.sensors || []
      delete args.input.sensors
    }

    device = new Device({ ... args.input })
    // eslint-disable-next-line
    device = await device.save()

    sensors = sensors.map(s => ({ ...s, device: device._id}))
    sensors = await Sensor.insertMany(sensors)
    // eslint-disable-next-line
    device.sensors = sensors.map(s => s._id)

    // console.log(device)
    

    await device.save()

  }
  if (args.input && args.input.id && Object.keys(args.input).length > 1) {
    if (args.input.sensors) {
      sensors = args.input.sensors || []
      delete args.input.sensors
    }
    // eslint-disable-next-line
    device = await Device.findById(args.input.id)

    // eslint-disable-next-line
    device = {
      ...device,
      ...args.input,
    }
    sensors = await Sensor.insertMany(sensors)
    // eslint-disable-next-line
    device.sensors = sensors.map(s => s._id)

    await device.save()

    console.log('UPDATE')
  }

  return device
}

export default {
  query,
  mutation
}