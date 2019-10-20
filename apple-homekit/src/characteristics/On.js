const { AMQP_MQTT_LISTENER_QUEUE } = process.env

module.exports = function (obj, iface) {
  const {acc} = obj
  const {
    Characteristic,
    logger,
    amqp,
    getSensorStatus,
    accConfig,
    EventBridge
  } = iface

  acc.getService(accConfig.id)
    .getCharacteristic(Characteristic.On)
    .on('set', (value, callback) => {
      logger.info(`< hap set ${accConfig.name} 'On ${value}`)
      const on = value ? 1 : 0
      
      amqp.publish(
        AMQP_MQTT_LISTENER_QUEUE,
        {
          info: {
            operation: 'set-value',
          },
          input: {
            sensor: {
              _id: accConfig.id,
              mqttSetTopic: accConfig.mqttSetTopic,
              type: accConfig.category,
              value: on,
            }
          }
        })
      callback()
    })

  /* istanbul ignore else */
  if (accConfig.mqttSetTopic) {
    EventBridge.on(accConfig.id, val => {
      const on = val === 1
      logger.info(`> hap update ${accConfig.name} On ${on}`)
      acc.getService(accConfig.id)
        .updateCharacteristic(Characteristic.On, on)
    })

    acc.getService(accConfig.id)
      .getCharacteristic(Characteristic.On)
      .on('get', callback => {
        logger.info(`< hap get ${accConfig.name} On`)
        const on = getSensorStatus(accConfig.id) === 1
        logger.info(`> hap re_get ${accConfig.name} On ${on}`)
        callback(null, on)
      })
  }
}
