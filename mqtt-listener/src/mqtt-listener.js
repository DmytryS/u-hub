import { logger, amqp } from './lib/index.js' 
import { inspect } from 'util'

const {
  AMQP_APPLE_HOMEKIT_QUEUE,
  AMQP_APOLLO_QUEUE,
} = process.env

const typeGuess = (payload) => {
  let state
  
  if (payload === 'true') {
    state = true
  } else if (payload === 'false') {
    state = false
  } else if (isNaN(payload)) {
    if (payload.indexOf('{') !== -1) {
      try {
        state = JSON.parse(payload)
      } catch (err) {
        state = payload
      }
    }
  } else {
    state = parseFloat(payload)
  }
  return state
}

const listener = async (topic, payload) => {
  payload = typeGuess(payload)
  
  logger.debug(`[MQTT-LISTENER] ${topic} ${payload}`)

  const deviceName = topic.split('/')[0]
  const sensorType = topic.split('/')[2]

  const message = {
    info: {
      operation: 'add-value'
    },
    input: {
      device: {
        name: deviceName,
        sensor: {
          type: sensorType,
          value: payload
        }
      }
    }
  }

  console.log(inspect(message, {depth: 7, colors: true}))

  await amqp.publish(
    AMQP_APOLLO_QUEUE,
    message
  )

  await amqp.publish(
    AMQP_APPLE_HOMEKIT_QUEUE,
    message
  )
}

export default listener