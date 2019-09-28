module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  settings.topic.statusCurrentRelativeHumidity = settings.topic.statusCurrentRelativeHumidity || settings.topic.statusHumidity

  /* istanbul ignore else */
  if (settings.topic.statusCurrentRelativeHumidity) {
    mqttSub(settings.topic.statusCurrentRelativeHumidity, settings.json.statusCurrentRelativeHumidity, val => {
      logger.debug(`> hap update ${settings.name} CurrentRelativeHumidity ${val}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} CurrentRelativeHumidity`)
        logger.debug(`> hap re_get ${settings.name} CurrentRelativeHumidity ${mqttStatus(settings.topic.statusCurrentRelativeHumidity, settings.json.statusCurrentRelativeHumidity)}`)
        callback(null, mqttStatus[settings.topic.statusCurrentRelativeHumidity])
      })
  }
}
