module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_StatelessProgrammableSwitch(acc, settings, subtype) {
    acc.addService(Service.StatelessProgrammableSwitch, settings.name, subtype)

    settings.topic.statusProgrammableSwitchEvent = settings.topic.statusProgrammableSwitchEvent || settings.topic.statusEvent

    mqttSub(settings.topic.statusProgrammableSwitchEvent, settings.json.statusProgrammableSwitchEvent, val => {
      log.debug('> hap set', settings.name, 'ProgrammableSwitchEvent', val)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.ProgrammableSwitchEvent, val)
    })
  }
}
