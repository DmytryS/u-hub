import { logger, mongo } from './lib/index.js'

import { inspect } from 'util'

export default async (message) => {
  logger.info(`[AMQP] MESSAGE: ${inspect(message, { depth:4, colors: true})}`)

  const client = mongo.connection()
  const device = await client.collection('Device').findAndModify({
    query: { name: message.input.device.name },
    update: {
      $setOnInsert: { name: message.input.device.name }
    },
    upsert: true
  })

  logger.info(`DEVICE ${inspect(device, { depth:2, colors: true})}`)

  switch(message.info.operation) {
    case 'add-value':
      // eslint-disable-next-line
      

      
      break
    case 'update-device-state':
      break
    default:
      logger.error(`Unknown operation ${message.info.operation}`)
  }
}
