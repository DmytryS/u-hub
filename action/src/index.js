import { logger, amqp } from './lib/index.js'
import create from './create.js'
import { readAll, readOne } from './read.js'
import remove from './remove.js'
import update from './update.js'

const listener = (message) => {
  logger.info(`MESSAGE: ${JSON.stringify(message)}`)

  switch (message.info.action) {
    case 'CREATE':
      return create(message)
    case 'UPDATE':
      return update(message)
    case 'READ':
      return readOne(message)
    case 'READ_ALL':
      return readAll(message)
    case 'DELETE':
      return remove(message)
    default:
      throw new Error('Unknown action')
  }
}

amqp.listen(process.env.AMQP_ACTION_QUEUE, listener)
