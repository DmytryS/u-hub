import { amqp, mqtt } from './lib/index.js'
import mqttListener from './mqtt-listener.js'
import amqpListener from './amqp-listener.js'

const {
  AMQP_MQTT_LISTENER_QUEUE,
  MQTT_TOPIC,
} = process.env

// {{BRIDGE_NAME}}/{{DEVICE_NAME}}/action/{{SENSOR_NAME}}/set
// ${BRIDGE_NAME}/${DEVICE_NAME}/${SENSOR_TYPE}/${SENSOR_NAME}/status

// mqtt.subscribe(MQTT_TOPIC)
mqtt.listen(MQTT_TOPIC, mqttListener)

amqp.listen(AMQP_MQTT_LISTENER_QUEUE, amqpListener)
