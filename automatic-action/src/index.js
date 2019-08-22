import { amqp, logger } from './lib/index.js'

const listener = (message) => {
  logger.info('MESSAGE:', message)

}

amqp.listen(process.env, listener)
