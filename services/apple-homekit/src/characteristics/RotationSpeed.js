module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  settings.payload.rotationSpeedFactor = settings.payload.rotationSpeedFactor || 1

  /* istanbul ignore else */
  if (settings.topic.setRotationSpeed) {
    acc.getService(subtype)
      .getCharacteristic(Characteristic.RotationSpeed)
      .on('set', (value, callback) => {
        logger.debug(`< hap set ${settings.name} RotationSpeed ${value}`)
        /* istanbul ignore next */
        const speed = (value * settings.payload.rotationSpeedFactor) || 0
        mqttPub(settings.topic.setRotationSpeed, speed)
        callback()
      })
  }

  /* istanbul ignore else */
  if (settings.topic.statusRotationSpeed) {
    mqttSub(settings.topic.statusRotationSpeed, settings.json.statusRotationSpeed, val => {
      /* istanbul ignore next */
      const speed = (val / settings.payload.rotationSpeedFactor) || 0
      logger.debug(`> hap update ${settings.name} RotationSpeed ${speed}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.RotationSpeed, speed)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.RotationSpeed)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} RotationSpeed`)
        /* istanbul ignore next */
        const speed = (mqttStatus(settings.topic.statusRotationSpeed, settings.json.statusRotationSpeed) / settings.payload.rotationSpeedFactor) || 0
        logger.debug(`> hap re_get ${settings.name} RotationSpeed ${speed}`)
        callback(null, speed)
      })
  }
}
