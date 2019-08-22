import { amqp, logger } from './lib/index.js'

// eslint-disable-next-line
const resolver = async (req, res, next) => {
  logger.info('[Resolver] I`m in resolver :)')

  const output = await amqp.request()

  res.json(output)
}

export default resolver
