import { inspect } from 'util'
import { logger, mongo } from './lib/index.js'

export default async (message) => {
  if ( Object.keys(message).length === 0 || message.info.operation === 'set-value') {
    return
  }

  logger.info(`[AMQP] MESSAGE: ${inspect(message, { depth:4, colors: true})}`)


  const client = mongo.connection()
  const device = await client.collection('Device').findOneAndUpdate(
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

  const sensor = await client.collection('Sensor').findOneAndUpdate(
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

  // logger.info(`DEVICE: ${inspect(device, { depth:2, colors: true})}`)
  // logger.info(`SENSOR: ${inspect(sensor, { depth:2, colors: true})}`)

  switch(message.info.operation) {
    case 'add-value':
      // eslint-disable-next-line
      await client.collection('Value').insertOne(
        {
          sensor: device._id,
          value: message.input.device.sensor.value
        })
        
      
      break
    // case 'update-device-state':
    //   break
    default:
      logger.error(`Unknown operation ${message.info.operation}`)
  }
}
