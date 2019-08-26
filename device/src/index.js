import { logger, amqp } from './lib/index.js'
import create from './create.js'
import update from './update.js'
import { readAll, readOne } from './read.js'
import remove from './remove.js'

const { AMQP_DEVICE_QUEUE } = process.env

// {
//     info: {
//         action: 'CREATE',
//         service: 'device'
//     },
//     data: { ... },
// }

const listener = async (message) => {
  logger.info(`MESSAGE: ${JSON.stringify(message)}`)

  switch (message.info.action) {
    case 'CREATE':
      return create(message.data)
    case 'UPDATE':
      return update(message.data)
    case 'READ':
      return readOne(message.data)
    case 'READ_ALL':
      return readAll(message.data)
    case 'DELETE':
      return remove(message.data)
    default:
      throw new Error('Unknown action')
  }
}

amqp.listen(AMQP_DEVICE_QUEUE, listener)
