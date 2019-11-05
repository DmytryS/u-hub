module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_MotionSensor(acc, settings, subtype) {
    acc.addService(Service.MotionSensor, settings.name, subtype)

    require('../characteristics/MotionDetected')({acc, settings, subtype}, iface)
    require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface)
    require('../characteristics/StatusActive')({acc, settings, subtype}, iface)
    require('../characteristics/StatusFault')({acc, settings, subtype}, iface)
    require('../characteristics/StatusTampered')({acc, settings, subtype}, iface)
  }
}
