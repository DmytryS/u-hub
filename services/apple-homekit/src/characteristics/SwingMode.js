module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore else */
  if (settings.topic.setSwingMode) {
    acc.getService(subtype)
      .getCharacteristic(Characteristic.SwingMode)
      .on('set', (value, callback) => {
        logger.debug(`< hap set ${settings.name} SwingMode ${value}`)
        mqttPub(settings.topic.setSwingMode, value)
        callback()
      })
  }

  /* istanbul ignore else */
  if (settings.topic.statusSwingMode) {
    mqttSub(settings.topic.statusSwingMode, settings.json.statusSwingMode, val => {
      logger.debug(`> hap update ${settings.name} SwingMode ${val}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.SwingMode, val)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.SwingMode)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} SwingMode`)
        const state = mqttStatus(settings.topic.statusSwingMode, settings.json.statusSwingMode)
        logger.debug(`> hap re_get ${settings.name} SwingMode ${state}`)
        callback(null, state)
      })
  }
}
