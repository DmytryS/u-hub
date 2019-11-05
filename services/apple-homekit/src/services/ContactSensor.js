module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, logger, Service, Characteristic} = iface

  return function createService_ContactSensor(acc, settings, subtype) {
    acc.addService(Service.ContactSensor, settings.name, subtype)
      .getCharacteristic(Characteristic.ContactSensorState)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} ContactSensorState`)
        const contact = mqttStatus(settings.topic.statusContactSensorState, settings.json.statusContactSensorState) === settings.payload.onContactDetected ?
          Characteristic.ContactSensorState.CONTACT_DETECTED :
          Characteristic.ContactSensorState.CONTACT_NOT_DETECTED

        logger.debug(`> hap re_get ${settings.name} ContactSensorState ${contact}`)
        callback(null, contact)
      })

    mqttSub(settings.topic.statusContactSensorState, settings.json.statusContactSensorState, val => {
      const contact = val === settings.payload.onContactDetected ?
        Characteristic.ContactSensorState.CONTACT_DETECTED :
        Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
      logger.debug(`> hap update ${settings.name} ContactSensorState ${contact}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.ContactSensorState, contact)
    })

    require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface)
    require('../characteristics/StatusActive')({acc, settings, subtype}, iface)
    require('../characteristics/StatusFault')({acc, settings, subtype}, iface)
    require('../characteristics/StatusTampered')({acc, settings, subtype}, iface)
  }
}
