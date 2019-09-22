import { amqp, logger, mongo } from './lib/index.js'

const processScheduledActions = async () => {
  try {
    logger.info('Finding active scheduled actions')
    const client = mongo.connection()
    const actions = await client.collection('ScheduledAction').find({})

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
    await mongo.disconnect()
  } catch (error) {
    logger.error(error)
    logger.warn('Shutdown after error')

    await amqp.close()
    await mongo.disconnect()
  }
}

processScheduledActions()
