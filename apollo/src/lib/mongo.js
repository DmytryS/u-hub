import mongodb from 'mongodb'
import logger from './logger.js'

const { MONGODB_URI, MONGO_DB = 'apollo-test' } = process.env
const { MongoClient } = mongodb
const options = {
  autoReconnect: true,
  reconnectTries: 1e6,
  useNewUrlParser: true
}
let db
let client

const closeConnection = () => client.close()

const onConnecting = () => logger.info('[MONGODB] connecting')
const onConnected = () => logger.info(`[MONGODB] connected, db: ${MONGO_DB}`)
const onReconnected = () => logger.info('[MONGODB] reconnected')
const onClose = () => logger.info('[MONGODB] connection closed')
const onError = (e) => logger.error(`[MONGODB] error: ${e}`)
const onTimeout = () => logger.error('[MONGODB] timeout')

MongoClient.connect(MONGODB_URI, options)
  .then(connection => {
    db = connection.db(MONGO_DB)

    client = connection

    connection.on('serverOpening', onConnecting)
    connection.on('connected', onConnected)
    connection.on('reconnect', onReconnected)
    connection.on('close', onClose)
    connection.on('error', onError)
    connection.on('timeout', onTimeout)
  })
  .then(onConnected)

process.on('SIGTERM', closeConnection)

export const disconnect = closeConnection

export default () => db
