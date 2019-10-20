import { inspect } from 'util'
import mongodb from 'mongodb'
import { logger, mongo, amqp } from './lib/index.js'

const { ObjectId } = mongodb
const { AMQP_APPLE_HOMEKIT_QUEUE } = process.env

const reinitializeAppleHomeKit = () => amqp.publish(
  AMQP_APPLE_HOMEKIT_QUEUE,
  {
    info: {
      operation: 'reinitialize-sensors'
    }
  }
)

const getSensor = async (client, message) => {
  const sensor = await client.collection('Sensor')
    .findOneAndUpdate(
      {
        mqttStatusTopic: message.input.sensor.mqttStatusTopic,
        deleted: { $ne : true }
      },
      {
        $set: {
          mqttStatusTopic: message.input.sensor.mqttStatusTopic
        }
      },
      {
        upsert: true,
        returnNewDocument: true,
        returnOriginal: false,
      }
    )
    .then(async res => {
      if (res.lastErrorObject.updatedExisting === false) {
        await reinitializeAppleHomeKit()
      }

      return res.value
    })

  if (!sensor.name) {
    await client.collection('Sensor').updateOne(
      {
        _id: sensor._id
      },
      {
        $set: {
          name: message.input.sensor.name,
        }
      }
    )
  }

  return sensor
}

export default async (message) => {
  if ( Object.keys(message).length === 0 || message.info.operation === 'set-value') {
    return
  }

  logger.info(`[AMQP] MESSAGE: ${inspect(message, { depth:4, colors: true})}`)

  const client = mongo.connection()
  let sensor

  if (['add-value', 'get-automatic-actions'].includes(message.info.operation)) {
    sensor = await getSensor(client, message)
  }

  switch(message.info.operation) {
    case 'add-value':
      // eslint-disable-next-line
      const insertedValue = await client.collection('Value').insertOne(
        {
          sensor: {
            _id: sensor._id,
            mqttStatusTopic: sensor.mqttStatusTopic,
            mqttSetTopic: sensor.mqttSetTopic,
            name: sensor.name,
            type: sensor.type
          },
          value: message.input.sensor.value,
          createdAt: new Date()
        }
      )

      // eslint-disable-next-line
      message.output = insertedValue
      break
    case 'get-automatic-actions':
      // eslint-disable-next-line
      const automaticActions = await client.collection('AutomaticAction').find({
        sensor: sensor._id,
        enabled: true,
        deleted: { $ne: true }
      }).toArray()

      // eslint-disable-next-line
      message.output = automaticActions
      break
    case 'get-scheduled-actions':
      // eslint-disable-next-line
      const filter = message.input && message.input.scheduledAction
        ? {
          _id: Array.isArray(message.input.scheduledAction)
            ? { $in: message.input.scheduledAction.map(a => ObjectId(a))}
            : ObjectId(message.input.scheduledAction),
          deleted: { $ne: true }
        }
        : {deleted: { $ne: true }}
      // eslint-disable-next-line
      const scheduledActions = await client.collection('ScheduledAction').find(filter).toArray()
      // eslint-disable-next-line
      message.output = scheduledActions
      break
    case 'get-actions':
      // eslint-disable-next-line
      const actions = await client.collection('Action').find({
        _id: { $in: message.input.action.map(a => ObjectId(a)) },
        deleted: { $ne: true }
      }).toArray()
      
      // eslint-disable-next-line
      message.output = actions
      break
    case 'get-sensor':
      // eslint-disable-next-line
      const sensorFilter = message.input && message.input.sensor
        ? {
          _id: Array.isArray(message.input.sensor)
            ? { $in: message.input.sensor.map(s => ObjectId(s))}
            : ObjectId(message.input.sensor),
          deleted: { $ne: true }
        }
        : { deleted: { $ne: true } }
      // eslint-disable-next-line
      const _sensor = await client.collection('Sensor').find(sensorFilter).toArray()

      // eslint-disable-next-line
      message.output = _sensor
      break
    default:
      logger.error(`Unknown operation ${message.info.operation}`)
  }

  return message
}
