module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttSub, Characteristic, logger} = iface

  if (typeof settings.payload.faultTrue !== 'undefined') {
    settings.payload.onFault = settings.payload.faultTrue
  }

  /* istanbul ignore else */
  if (settings.topic.statusFault) {
    acc.getService(subtype)
      .getCharacteristic(Characteristic.StatusFault)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} StatusFault`)
        let bool = mqttStatus(settings.topic.statusFault, settings.json.statusFault) === settings.payload.onFault
        if (settings.payload.invertFault) {
          bool = !bool
        }
        const fault = bool ?
          Characteristic.StatusFault.GENERAL_FAULT :
          Characteristic.StatusFault.NO_FAULT
        logger.debug(`> hap re_get ${settings.name} StatusFault ${fault}`)
        callback(null, fault)
      })

    mqttSub(settings.topic.statusFault, settings.json.statusFault, val => {
      let bool = val === settings.payload.onFault
      if (settings.payload.invertFault) {
        bool = !bool
      }
      const fault = bool ?
        Characteristic.StatusFault.GENERAL_FAULT :
        Characteristic.StatusFault.NO_FAULT
      logger.debug(`> hap update ${settings.name} StatusFault ${fault}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.StatusFault, fault)
    })
  }
}
