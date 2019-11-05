module.exports = function (obj, iface) {
  const {acc} = obj
  // eslint-disable-next-line
  const {accConfig, Characteristic, logger, EventBridge, getSensorStatus} = iface

  // function convertTemperature(settings, value) {
  //   if (settings.payload.fahrenheit) {
  //     logger.debug(`converting ${value} °F to °C`)
  //     return (value - 32) / 1.8
  //   }
  //   return value
  // }

  // settings.topic.statusCurrentTemperature = settings.topic.statusCurrentTemperature || settings.topic.statusTemperature

  acc.getService(accConfig.id)
    .getCharacteristic(Characteristic.CurrentTemperature)
    .setProps({minValue: -100}) // (settings.props || {}).CurrentTemperature || 
    .on('get', callback => {
      const temperature = getSensorStatus(accConfig.id)//convertTemperature(settings, mqttStatus(settings.topic.statusCurrentTemperature, settings.json.statusCurrentTemperature))
      logger.debug(`< hap get ${accConfig.name} CurrentTemperature`)
      logger.debug(`> hap re_get ${accConfig.name} ${temperature}`)
      callback(null, temperature)
    })

  EventBridge.on(accConfig.id, val => {
    const temperature = val //convertTemperature(settings, val)
    logger.debug(`> hap update ${accConfig.name} CurrentTemperature ${temperature}`)
    acc.getService(accConfig.id)
      .updateCharacteristic(Characteristic.CurrentTemperature, temperature)
  })
}
