module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  acc.getService(subtype)
    .getCharacteristic(Characteristic.On)
    .on('set', (value, callback) => {
      logger.debug(`< hap set ${settings.name} 'On ${value}`)
      const on = value ? settings.payload.onTrue : settings.payload.onFalse
      mqttPub(settings.topic.setOn, on)
      callback()
    })

  /* istanbul ignore else */
  if (settings.topic.statusOn) {
    mqttSub(settings.topic.statusOn, settings.json.statusOn, val => {
      const on = val === settings.payload.onTrue
      logger.debug(`> hap update ${settings.name} On ${on}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.On, on)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.On)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} On`)
        const on = mqttStatus(settings.topic.statusOn, settings.json.statusOn) === settings.payload.onTrue
        logger.debug(`> hap re_get ${settings.name} On ${on}`)
        callback(null, on)
      })
  }
}
