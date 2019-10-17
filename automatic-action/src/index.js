import 'dotenv/config.js'
import { logger, amqp } from './lib/index.js'

const {
  AMQP_APOLLO_QUEUE,
  AMQP_AUTOMATIC_ACTION_QUEUE,
  // AMQP_MQTT_LISTENER_QUEUE
} = process.env

const listener = async (message) => {
  logger.info(`MESSAGE: ${message}`)

  const automaticActions = await amqp.request(
    AMQP_APOLLO_QUEUE,
    {
      info: {
        operation: 'get-automatic-actions'
      },
      input: {
        device: {
          name: message.input.device.name,
          sensor: {
            type: message.input.device.sensor.type
          }
        }
      }
    }
  )

  console.log('AUTOMATIC_ACTIONS:', automaticActions)
    
}

amqp.listen(AMQP_AUTOMATIC_ACTION_QUEUE, listener)
