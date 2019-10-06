import mqtt from 'mqtt'
import logger from './logger.js'

const { MQTT_URI } = process.env

const options = {
  port: 1883,
  keepalive : 60
}

let client
const mqttConnect = () => {
  logger.info(`[MQTT] Connected to "${MQTT_URI}"`)
}

// eslint-disable-next-line
const mqttSubscribe = (topic) => (err, granted) => {
  logger.info(`[MQTT] Subscribed to "${topic}" topic`)
  if (err) {
    logger.error(`[MQTT] ${err}`)
  }
}

const mqttReconnect = (err) => {
  logger.info(`[MQTT] Reconnected "${MQTT_URI}"`)
  if (err) {
    logger.error(`[MQTT] ${err}`)
  }
  client = mqtt.connect(MQTT_URI, options)
}

const mqttError = (err) => {
  if (err) {
    logger.error(`[MQTT] ${err}`)
  }
}

const mqttClose = () => {
  logger.info(`[MQTT] Close connection to "${MQTT_URI}"`)
}

client = mqtt.connect(MQTT_URI, options)
client.on('connect', mqttConnect)
client.on('reconnect', mqttReconnect)
client.on('error', mqttError)
client.on('close', mqttClose)

// export const subscribe = (topic) => {
//   client.subscribe(topic, mqttSubscribe(topic))
// }

export const listen = (topic, cb) => {
  client.subscribe(topic, mqttSubscribe(topic))
  client.on(
    'message',
    (cbTopic, payload) => {
      try{
        if(cbTopic === topic || topic === '#') {
          cb(cbTopic, payload)
        }
      }catch(err) {
        logger.error(`[MQTT] ${err}`)
      }
    }
  )
}

export const publish = (topic, message) => {
  client.publish(topic, message)
}
