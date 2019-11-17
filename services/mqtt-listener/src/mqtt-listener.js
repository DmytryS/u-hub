import { logger, amqp } from './lib/index.js' 

const {
  AMQP_APPLE_HOMEKIT_QUEUE,
  AMQP_APOLLO_QUEUE,
  AMQP_AUTOMATIC_ACTION_QUEUE,
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

  const message = {
    info: {
      operation: 'add-value'
    },
    input: {
      sensor: {
        name: topic,
        mqttStatusTopic: topic,
        value: payload
      }
    }
  }

  const { output: data } = await amqp.request(
    AMQP_APOLLO_QUEUE,
    message
  )

  if (data.sensor.type) { // data.sensor.mqttSetTopic && 
    message.input.sensor.mqttSetTopic = data.sensor.mqttSetTopic
    message.input.sensor.id = data.sensor.id
    await Promise.all([
      amqp.publish(
        AMQP_APPLE_HOMEKIT_QUEUE,
        message
      ),
      amqp.publish(
        AMQP_AUTOMATIC_ACTION_QUEUE,
        message
      )
    ])
  }
}

export default listener
