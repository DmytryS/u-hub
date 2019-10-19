import amqp from 'amqplib'
import crypto from 'crypto'
import EventEmitter from 'events'
import logger from './logger.js'

const REPLY_QUEUE = 'amq.rabbitmq.reply-to'
const RETRIES = 5
const { RABBIT_MQ_URI, RABBIT_RECONNECT_INTERVAL } = process.env
const CONNECTIONS = {
  connection: false,
  channel: false
}
let counter = 0

const onError = (err) => {
  if (err.message !== 'Connection closing') {
    logger.info(`[AMQP] ERROR: ${err.message}`)
  }
}

const connect = (infinityRetries) => new Promise((resolve, reject) => {
  setInterval(
    async function () {
      counter++
      logger.info(`[AMQP] Trying to connect ${RABBIT_MQ_URI}`)

      try {
        CONNECTIONS.connection = await amqp.connect(RABBIT_MQ_URI)

        logger.info(`[AMQP] Connected ${RABBIT_MQ_URI}`)
        logger.info('[AMQP] Creating channel')

        // eslint-disable-next-line
        CONNECTIONS.channel = await CONNECTIONS.connection.createChannel()
        CONNECTIONS.connection.on('error', onError)
        // eslint-disable-next-line
        CONNECTIONS.channel.responseEmitter = new EventEmitter()
        CONNECTIONS.channel.responseEmitter.setMaxListeners(0)
        CONNECTIONS.channel.consume(
          REPLY_QUEUE,
          message => CONNECTIONS.channel.responseEmitter.emit(
            message.properties.correlationId,
            message,
          ),
          { noAck: true },
        )
      

        clearInterval(this)

        logger.info('[AMQP] Created channel')

        resolve()
      } catch (err) {
        // eslint-disable-next-line
        CONNECTIONS.channel = false
        // eslint-disable-next-line
        CONNECTIONS.connection = false

        logger.error(`[AMQP] ERROR: ${JSON.stringify(err)}`)

        if (counter >= RETRIES && !infinityRetries) {
          clearInterval(this)
          reject(`[AMQP] Failed to connect to ${RABBIT_MQ_URI}`)
        }
      }
    },
    RABBIT_RECONNECT_INTERVAL
  )
})

// eslint-disable-next-line
export const publish = async (queue, message, options) => {
  if (!CONNECTIONS.connection) {
    await connect()
  }

  logger.info(`[AMQP] Publishing data to ${queue}`)

  await CONNECTIONS.channel.assertQueue(queue, {durable: false})

  return CONNECTIONS.channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    options
  )
}

export const listen = async (queue, callback) => {
  if (!CONNECTIONS.connection) {
    await connect(true)
  }

  await CONNECTIONS.channel.assertQueue(queue, {durable: false})

  logger.info(`[AMQP] Listening ${queue} queue`)

  CONNECTIONS.channel.consume(queue, async (message) => {
    let ouputMessage = {}

    try {
      ouputMessage = await callback(JSON.parse(message.content.toString()))
    } catch (err) {
      logger.error(`[AMQP] Listener ERROR: ${err}`)
      ouputMessage.error = err
    }
    

    const { correlationId, replyTo } = message.properties
    
    if (correlationId && replyTo) {
      try {
        await publish(replyTo, ouputMessage, {correlationId})
      }catch(err) {
        logger.error(`[AMQP] Listener response error: ${err}`)
      }
    }

    await CONNECTIONS.channel.ack(message)
  })
}

// eslint-disable-next-line
export const request = async (queue, message) => {
  let timeout

  if (!CONNECTIONS.connection) {
    await connect()
  }

  logger.info(`[AMQP] Requesting data from ${queue}`)

  const correlationId = crypto.randomBytes(7).toString('hex')

  await CONNECTIONS.channel.assertQueue(queue, { durable: false })
  await CONNECTIONS.channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    { 
      correlationId,
      replyTo: REPLY_QUEUE,
    }
  )

  // eslint-disable-next-line
  return new Promise(async (resolve, reject) => {
    CONNECTIONS.channel.responseEmitter.once(
      correlationId,
      (message) => {
        clearTimeout(timeout)
        resolve(JSON.parse(message.content.toString()))
      }
    )

    timeout = setTimeout(async () => {
      CONNECTIONS.channel.responseEmitter.removeAllListeners(correlationId)
      reject(new Error('AMQP RPC timeout'))
    }, 500)
  })
}

export const close = async () => {
  if (CONNECTIONS.channel) {
    await CONNECTIONS.channel.close()
  }

  if (CONNECTIONS.connection) {
    await CONNECTIONS.connection.close()
  }

  // eslint-disable-next-line
  CONNECTIONS.channel = false
  // eslint-disable-next-line
  CONNECTIONS.connection = false

  logger.info(`[AMQP] Disconnected from ${RABBIT_MQ_URI}`)
}
