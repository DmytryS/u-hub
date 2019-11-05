module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_Microphone(acc, settings, subtype) {
    acc.addService(Service.Microphone, settings.name, subtype)

    require('../characteristics/Mute')({acc, settings, subtype}, iface)
    require('../characteristics/Volume')({acc, settings, subtype}, iface)
  }
}
