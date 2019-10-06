import mqtt from 'mqtt'
import logger from './logger.js'

const { MQTT_URI } = process.env
const TOPIC = '#'
const options = {
  clientId: 'MyMQTT',
  port: 1883,
  keepalive : 60
}

let client

const mqttConnect = () => {
  logger.info(`[MQTT] Connecting ${MQTT_URI}  Topic: ${TOPIC}`)
  client.subscribe(TOPIC, mqttSubscribe)
}

// eslint-disable-next-line
const mqttSubscribe = (err, granted) => {
  logger.info(`[MQTT] Subscribed to ${TOPIC}`)
  if (err) {console.log(err)}
}

const mqttReconnect = (err) => {
  logger.info(`[MQTT] Reconnect ${MQTT_URI} ${TOPIC}`)
  if (err) {
    logger.error(`[MQTT] ${err}`)
  }
  client  = mqtt.connect(MQTT_URI, options)
}

const mqttError = (err) => {
  if (err) {
    logger.error(`[MQTT] ${err}`)
  }
}

// const mqttMesssageReceived = (topic, message, packet) => {
//   logger.info(`[MQTT] Received message. TOPIC: ${topic}  MESSAGE: ${message}`)
// }

const mqttClose = () => {
  logger.info(`[MQTT] Close connection to ${TOPIC}`)
}

client = mqtt.connect(MQTT_URI, options)
client.on('connect', mqttConnect)
client.on('reconnect', mqttReconnect)
client.on('error', mqttError)
// client.on('message', mqttMesssageReceived)
client.on('close', mqttClose)

export const listen = (cb) => {
  client.on('message', cb)
}

export const publish = (topic, message) => {
  client.publish(topic, message)
}
