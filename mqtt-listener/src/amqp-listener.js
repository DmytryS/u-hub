import { inspect } from 'util'
import { logger, mqtt } from './lib/index.js' 

const listener = async (message) => {
  logger.info(`[AMQP-LISTENER] MESSAGE: ${inspect(message, {depth: 7, colors: true})}`)

  if (message.input.sensor && message.input.sensor.mqttSetTopic) {
    const topic = message.input.sensor.mqttSetTopic
    const payload = message.input.sensor.value
  
    await mqtt.publish(
      topic,
      payload
    )
  }

}

export default listener
