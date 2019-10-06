import { logger, mqtt } from './lib/index.js'

const BRIDGE_NAME = 'BRIDGE_1'
const DEVICE_NAME = 'DEVICE_2'
const SENSOR_TYPE = 'sensor' // action
const SENSOR_NAME = 'DHT_22'

const STATUS_TOPIC = `${BRIDGE_NAME}/${DEVICE_NAME}/${SENSOR_TYPE}/${SENSOR_NAME}/status`

const randomInteger = (min, max) => {
    const rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

const sendStatus = () => {
    const data = randomInteger(18,28).toString()
    mqtt.publish(STATUS_TOPIC, data)

    logger.info(`Sent data "${data}" to "${STATUS_TOPIC}"`)
}

setInterval(sendStatus, 5000)
