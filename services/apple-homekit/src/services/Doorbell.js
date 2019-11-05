module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, logger, Service, Characteristic} = iface

  return function createService_Doorbell(acc, settings, subtype) {
    acc.addService(Service.Doorbell, settings.name, subtype)

    mqttSub(settings.topic.statusEvent, settings.json.statusEvent, () => {
      logger.debug(`> hap update ${settings.name} ProgrammableSwitchEvent ${0}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.ProgrammableSwitchEvent, 0)
    })
  }
}
