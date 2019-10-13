import { inspect } from 'util'
import { logger, mqtt } from './lib/index.js' 

const listener = async (message) => {
  logger.debug(`[AMQP-LISTENER] MESSAGE: ${inspect(message, {depth: 7, colors: true})}`)

  const topic = `${message.input.device.name}/${message.input.device.sensor.type}/set`
  const payload = message.input.device.sensor.value

  await mqtt.publish(
    topic,
    payload
  )
}

export default listener