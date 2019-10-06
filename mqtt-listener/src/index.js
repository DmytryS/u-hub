
import { amqp, mqtt } from './lib/index.js'
import mqttListener from './mqtt-listener.js'
import amqpListener from './amqp-listener.js'

const {
  AMQP_MQTT_LISTENER_QUEUE,
} = process.env

// {{BRIDGE_NAME}}/{{DEVICE_NAME}}/action/{{SENSOR_NAME}}/set
// ${BRIDGE_NAME}/${DEVICE_NAME}/${SENSOR_TYPE}/${SENSOR_NAME}/status

mqtt.listen(mqttListener)

amqp.listen(AMQP_MQTT_LISTENER_QUEUE, amqpListener)
