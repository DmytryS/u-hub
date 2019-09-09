// import { inspect } from 'util'
import mongoose from 'mongoose'
import { isArray } from './helpers/index.js'


const resolver = async (parent, args, context, info) => {
  const operation = info.operation.operation 


  if (operation === 'mutation' && args.input && args.input.id && Object.keys(args.input).length === 1) {
    console.log('DELETE')
  }
  if (operation === 'mutation' && args.input && !args.input.id && Object.keys(args.input).length) {
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
  if (operation === 'mutation' && args.input && args.input.id && Object.keys(args.input).length > 1) {
    console.log('UPDATE')

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

    
  }

  return device

  return 
}

export default resolver