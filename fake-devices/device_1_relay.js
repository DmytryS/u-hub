import { logger, mqtt } from './lib/index.js.js'

const DEVICE_NAME = 'DEVICE_1'
const SENSOR_TYPE = 'RELAY'

const STATUS_TOPIC = `${DEVICE_NAME}/${SENSOR_TYPE}/status`
const SET_TOPIC = `${DEVICE_NAME}/${SENSOR_TYPE}/set`

const STATE = {
    active: '0'
}

// mqtt.subscribe(SET_TOPIC)

const listener = (topic, payload, packet) => {
    if ((payload !== '1' && payload !== '0') || topic !== SET_TOPIC) {
        logger.info(`Unknown payload ${payload}. Topic: ${topic}`)
    }

    STATE.active = payload
    logger.info(`RELAY ${STATE.active}`)
    mqtt.publish(STATUS_TOPIC, STATE.active.toString())
}

mqtt.listen(SET_TOPIC, listener)

const randomInteger = (min, max) => {
    const rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

const sendStatus = () => {
    const data = STATE.active // randomInteger(18,28).toString()
    mqtt.publish(STATUS_TOPIC, data)

    logger.info(`Sent data "${data}" to "${STATUS_TOPIC}"`)
}

setInterval(sendStatus, 5000)
