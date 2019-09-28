import { logger, amqp } from './lib/index.js' 

const {
  AMQP_APPLE_HOMEKIT_QUEUE,
  AMQP_APOLLO_QUEUE,
} = process.env

const typeGuess = (payload) => {
  payload = payload.toString()
  let state
  
  if (payload === 'true') {
    state = true
  } else if (payload === 'false') {
    state = false
  } else if (isNaN(payload)) {
    state = payload
  } else {
    state = parseFloat(payload)
  }
  return state
}

const listener = async (topic, payload) => {
  payload = typeGuess(payload)
  if (payload.indexOf('{') !== -1) {
    try {
      payload = JSON.parse(payload)
    } catch (err) {
      logger.error('failed to parse json')
    }
  }
  
  logger.debug(`[MQTT] ${topic} ${payload}`)
  
  //   const bridgeName = topic.split('/')[1]
  const deviceName = topic.split('/')[2]
  const sensorType = topic.split('/')[3]
  const read = topic.split('/')[4]
  
  await amqp.publish(
    AMQP_APOLLO_QUEUE,
    {
        
    }
  )

  await amqp.publish(
    AMQP_APPLE_HOMEKIT_QUEUE,
    {
      
    }
  )
}

export default listener