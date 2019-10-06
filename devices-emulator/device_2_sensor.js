import { logger, mqtt } from './lib/index.js'

const BRIDGE_NAME = 'BRIDGE_1'
const DEVICE_NAME = 'DEVICE_2'
const SENSOR_TYPE = 'sensor' // action
const SENSOR_NAME = 'DHT_22'

const STATUS_TOPIC = `${BRIDGE_NAME}/${DEVICE_NAME}/${SENSOR_TYPE}/${SENSOR_NAME}/status`
const SET_TOPIC = `${BRIDGE_NAME}/${DEVICE_NAME}/${SENSOR_TYPE}/${SENSOR_NAME}/set`

// const listener = () => {

// }

// mqtt.listen()

const randomInteger = (min, max) => {
    const rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

const sendStatus = () => {
    const data = randomInteger(18,28).toString()
    mqtt.publish(STATUS_TOPIC, data)
}

setInterval(sendStatus, 5000)
