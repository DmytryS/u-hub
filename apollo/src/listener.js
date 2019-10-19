import { inspect } from 'util'
import mongodb from 'mongodb'
import { logger, mongo } from './lib/index.js'

const { ObjectId } = mongodb

const getDevice =  (client, message) => client.collection('Device').findOneAndUpdate(
  { name: message.input.device.name },
  {
    $set: { name: message.input.device.name }
  },
  {
    upsert: true,
    returnNewDocument: true,
    returnOriginal: false,
  }
).then(res => res.value)

const getSensor = (client, message, device) => client.collection('Sensor').findOneAndUpdate(
  {
    type: message.input.device.sensor.type,
    device: device._id
  },
  {
    $set: {
      type: message.input.device.sensor.type,
      device: device._id
    }
  },
  {
    upsert: true,
    returnNewDocument: true,
    returnOriginal: false,
  }
).then(res => res.value)

export default async (message) => {
  if ( Object.keys(message).length === 0 || message.info.operation === 'set-value') {
    return
  }

  logger.info(`[AMQP] MESSAGE: ${inspect(message, { depth:4, colors: true})}`)


  const client = mongo.connection()
  let device
  let sensor

  if (['add-value', 'get-automatic-actions'].includes(message.info.operation)) {
    device = await getDevice(client, message)
    sensor = await getSensor(client, message, device)
  
    if (!device.sensors || device.sensors.length === 0 || !device.sensors.find(s => s.toString() === sensor._id.toString())) {
      await client.collection('Device').updateOne(
        {
          _id: device._id
        },
        {
          $push: {
            sensors: {
              $each: [sensor._id]
            }
          }
        }
      )
    }
  }


  // logger.info(`DEVICE: ${inspect(device, { depth:2, colors: true})}`)
  // logger.info(`SENSOR: ${inspect(sensor, { depth:2, colors: true})}`)

  switch(message.info.operation) {
    case 'add-value':
      // // eslint-disable-next-line
      // const device = await getDevice(client, message)
      // // eslint-disable-next-line
      // const sensor = await getSensor(client, message, device)
  
      await client.collection('Value').insertOne(
        {
          sensor: sensor._id,
          value: message.input.device.sensor.value,
          createdAt: new Date()
        }
      )
      break
    case 'get-automatic-actions':
      // // eslint-disable-next-line
      // const _device = await getDevice(client, message)
      // // eslint-disable-next-line
      // const _sensor = await getSensor(client, message, _device)
      // eslint-disable-next-line
      const automaticActions = await client.collection('AutomaticAction').find({
        sensor: sensor._id,
        enabled: true
      }).toArray()

      // eslint-disable-next-line
      message.output = automaticActions
      break
    // case 'get-scheduled-actions':
    //   // eslint-disable-next-line
    //   const scheduledActions = await client.collection('ScheduledAction').find({
    //     sensor: sensor._id
    //   }).toArray()
    //   // eslint-disable-next-line
    //   message.output = scheduledActions
    //   break
    case 'get-actions':
      // eslint-disable-next-line
      const actions = await client.collection('Action').find({
        _id: { $in: message.input.action.map(a => ObjectId(a)) }
      }).toArray()
      
      // eslint-disable-next-line
      message.output = actions
      break
    case 'get-device':
      // eslint-disable-next-line
      const _device = await client.collection('Device').find({
        _id: Array.isArray(message.input.device) ? { $in: message.input.device.map(d => ObjectId(d)) } : message.input.device
      }).toArray()
          
      // eslint-disable-next-line
      message.output = _device
      break
    case 'get-sensor':
      // eslint-disable-next-line
      const _sensor = await client.collection('Sensor').find({
        _id: Array.isArray(message.input.sensor) ? { $in: message.input.sensor.map(s => ObjectId(s)) } : message.input.sensor
      }).toArray()

      // eslint-disable-next-line
      message.output = _sensor
      break
    default:
      logger.error(`Unknown operation ${message.info.operation}`)
  }

  return message
}
