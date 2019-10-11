import { inspect } from 'util'
import { logger, amqp, mqtt } from './lib/index.js' 

const {
  AMQP_APOLLO_QUEUE,
  AMQP_APPLE_HOMEKIT_QUEUE,
} = process.env

const listener = async (message) => {
  logger.debug(`[AMQP-LISTENER] MESSAGE: ${inspect(message, {depth: 7, colors: true})}`)

  await mqtt.publish()
  
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