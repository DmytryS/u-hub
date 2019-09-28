import Mqtt from 'mqtt'
import { logger, amqp } from './lib/index.js'
import mqttListener from './mqtt-listener.js'
import amqpListener from './amqp-listener.js'

const {
  MQTT_URL,
  AMQP_MQTT_LISTENER_QUEUE,
} = process.env

const mqtt = Mqtt.connect(MQTT_URL)

// {{BRIDGE_NAME}}/{{DEVICE_NAME}}/{{SENSOR_TYPE}}/set
// {{BRIDGE_NAME}}/{{DEVICE_NAME}}/{{SENSOR_TYPE}}/status

mqtt.on('connect', () => {
  logger.info(`[MQTT] connected ${MQTT_URL}`)
})

mqtt.on('reconnect', () => {
  logger.info('[MQTT] reconnect')
})

mqtt.on('offline', () => {
  logger.info('[MQTT] offline')
})

mqtt.on('close', () => {
  logger.info(`[MQTT] closed ${MQTT_URL}`)
})

mqtt.on('error', err => {
  logger.error(`[MQTT] error ${err}`)
})

mqtt.on('message', mqttListener)


amqp.listen(AMQP_MQTT_LISTENER_QUEUE, amqpListener)