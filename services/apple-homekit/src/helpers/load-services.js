import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from '../lib/index.js'

// const { AMQP_MQTT_LISTENER_QUEUE } = process.env

/* eslint-disable */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* eslint-enable */

const loadServices = () => {
  logger.info('loading services')
  const services = {}
  const servicesPath = path.join(__dirname, '../', 'services')
  const files = fs.readdirSync(servicesPath)

  files.forEach(file => {
    const service = file.replace(/\.js/, '')
    const servicePath = `${servicesPath}/${service}.js`
    logger.debug(`loading ${servicePath}`)

    // const curriedAmqpPub = queue => message => amqp.publish(queue, message)
    // const amqpPub = curriedAmqpPub(AMQP_MQTT_LISTENER_QUEUE)

    services[service] = require(servicePath) // ({ amqpPub, logger, Service, Characteristic, HAP })
  })

  return services
}

export default loadServices
  