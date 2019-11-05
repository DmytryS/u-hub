module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  // eslint-disable-next-line
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore else */
  if (settings.topic.statusCarbonMonoxideLevel) {
    mqttSub(settings.topic.statusCarbonMonoxideLevel, settings.json.statusCarbonMonoxideLevel, val => {
      logger.debug(`> hap update ${settings.name} CarbonMonoxideLevel ${val}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.CarbonMonoxideLevel, val)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.CarbonMonoxideLevel)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} CarbonMonoxideLevel`)
        logger.debug(`> hap re_get ${settings.name} CarbonMonoxideLevel ${mqttStatus(settings.topic.statusCarbonMonoxideLevel, settings.json.statusCarbonMonoxideLevel)}`)
        callback(null, mqttStatus[settings.topic.statusCarbonMonoxideLevel])
      })
  }
}
