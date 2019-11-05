module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore else */
  if (settings.topic.setLockPhysicalControls) {
    acc.getService(subtype)
      .getCharacteristic(Characteristic.LockPhysicalControls)
      .on('set', (value, callback) => {
        logger.debug(`< hap set ${settings.name} LockPhysicalControls ${value}`)
        mqttPub(settings.topic.setLockPhysicalControls, value)
        callback()
      })
  }

  /* istanbul ignore else */
  if (settings.topic.statusLockPhysicalControls) {
    mqttSub(settings.topic.statusLockPhysicalControls, settings.json.statusLockPhysicalControls, val => {
      logger.debug(`> hap update ${settings.name} LockPhysicalControls ${val}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.LockPhysicalControls, val)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.LockPhysicalControls)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} LockPhysicalControls`)
        const state = mqttStatus(settings.topic.statusLockPhysicalControls, settings.json.statusLockPhysicalControls)
        logger.debug(`> hap re_get ${settings.name} LockPhysicalControls ${state}`)
        callback(null, state)
      })
  }
}
