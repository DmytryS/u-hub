import { logger, amqp } from './lib/index.js' 

const {
  AMQP_APOLLO_QUEUE,
  AMQP_APPLE_HOMEKIT_QUEUE,
} = process.env

const listener = async (message) => {
  logger.info(`MESSAGE: ${message}`)
  
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