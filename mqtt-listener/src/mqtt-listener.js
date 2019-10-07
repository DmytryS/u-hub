import { logger, amqp } from './lib/index.js' 

const {
  // AMQP_APPLE_HOMEKIT_QUEUE,
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

  const deviceName = topic.split('/')[1]
  const sensorType = topic.split('/')[3]
  // const sensorValue = topic.split('/')[4]

  console.log({
    device: {
      name: deviceName,
      sensors: {
        type: sensorType,
        value: payload
      }
    }
  })

  

  await amqp.publish(
    AMQP_APOLLO_QUEUE,
    {
      info: {
        operation: 'add-value'
      },
      input: {
        device: {
          name: deviceName,
          sensors: {
            type: sensorType,
            value: payload
          }
        }
      }
    }
  )
  
  //   const bridgeName = topic.split('/')[1]

  
  // await amqp.publish(
  //   AMQP_APOLLO_QUEUE,
  //   {
        
  //   }
  // )

  // await amqp.publish(
  //   AMQP_APPLE_HOMEKIT_QUEUE,
  //   {
      
  //   }
  // )
}

export default listener