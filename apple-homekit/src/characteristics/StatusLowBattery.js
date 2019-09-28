module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore else */
  if (settings.topic.statusLowBattery) {
    acc.getService(subtype)
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} StatusLowBattery`)
        let bool = mqttStatus(settings.topic.statusLowBattery, settings.json.statusLowBattery) === settings.payload.onLowBattery
        if (settings.payload.invertLowBattery) {
          bool = !bool
        }
        const bat = bool ?
          Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
          Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        logger.debug(`> hap re_get ${settings.name} StatusLowBattery ${bat}`)
        callback(null, bat)
      })

    mqttSub(settings.topic.statusLowBattery, settings.json.statusLowBattery, val => {
      let bool = val === settings.payload.onLowBattery
      if (settings.payload.invertLowBattery) {
        bool = !bool
      }
      const bat = bool ?
        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
      logger.debug(`> hap update ${settings.name} StatusLowBattery ${bat}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.StatusLowBattery, bat)
    })
  }
}
