module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore else */
  if (settings.topic.statusCarbonDioxideLevel) {
    mqttSub(settings.topic.statusCarbonDioxideLevel, settings.json.statusCarbonDioxideLevel, val => {
      logger.debug(`> hap update ${settings.name} CarbonDioxideLevel ${val}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.CarbonDioxideLevel, val)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.CarbonDioxideLevel)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} CarbonDioxideLevel`)
        logger.debug(`> hap re_get ${settings.name} CarbonDioxideLevel ${mqttStatus[settings.topic.statusCarbonDioxideLevel]}`)
        callback(null, mqttStatus(settings.topic.statusCarbonDioxideLevel, settings.json.statusCarbonDioxideLevel))
      })
  }
}
