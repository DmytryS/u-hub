module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  // eslint-disable-next-line
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  function convertTemperature(settings, value) {
    if (settings.payload.fahrenheit) {
      logger.debug(`converting ${value} °F to °C`)
      return (value - 32) / 1.8
    }
    return value
  }

  settings.topic.statusCurrentTemperature = settings.topic.statusCurrentTemperature || settings.topic.statusTemperature

  acc.getService(subtype)
    .getCharacteristic(Characteristic.CurrentTemperature)
    .setProps((settings.props || {}).CurrentTemperature || {minValue: -100})
    .on('get', callback => {
      const temperature = convertTemperature(settings, mqttStatus(settings.topic.statusCurrentTemperature, settings.json.statusCurrentTemperature))
      logger.debug(`< hap get ${settings.name} CurrentTemperature`)
      logger.debug(`> hap re_get ${settings.name} ${temperature}`)
      callback(null, temperature)
    })

  mqttSub(settings.topic.statusCurrentTemperature, settings.json.statusCurrentTemperature, val => {
    const temperature = convertTemperature(settings, val)
    logger.debug(`> hap update ${settings.name} CurrentTemperature ${temperature}`)
    acc.getService(subtype)
      .updateCharacteristic(Characteristic.CurrentTemperature, temperature)
  })
}
