module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  acc.getService(subtype)
    .getCharacteristic(Characteristic.TemperatureDisplayUnits)
    .on('set', (value, callback) => {
      logger.debug(`< hap set ${settings.name} TemperatureDisplayUnits ${value}`)
      logger.debug(`> config ${settings.name} TemperatureDisplayUnits ${value}`)
      settings.config.TemperatureDisplayUnits = value
      callback()
    })

  acc.getService(subtype)
    .getCharacteristic(Characteristic.TemperatureDisplayUnits)
    .on('get', callback => {
      logger.debug(`< hap get ${settings.name} TemperatureDisplayUnits`)
      logger.debug(`> hap re_get ${settings.name} TemperatureDisplayUnits ${settings.config.TemperatureDisplayUnits || 0}`)
      callback(null, settings.config.TemperatureDisplayUnits || 0)
    })
}
