import { amqp, logger, mongo } from './lib/index.js'
import { ScheduledAction } from './models/index.js'

const processScheduledActions = async () => {
  try {
    logger.info('Finding active scheduled actions')
    const actions = await ScheduledAction.find({})

    for (const action of actions) {
      const output = {
        action: action._id.toString()
      }

      await amqp.send(
        'SOMEWHERE_QUEUE',
        JSON.stringify(output)
      )
    }

    await amqp.close()
    await mongo.connection.close()
  } catch (error) {
    logger.error(error)
    logger.warn('Shutdown after error')

    await amqp.close()
    await mongo.connection.close()
  }
}

processScheduledActions()
