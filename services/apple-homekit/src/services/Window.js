module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_Window(acc, settings, subtype) {
    acc.addService(Service.Window, settings.name, subtype)

    const obj = {acc, settings, subtype}

    require('../characteristics/TargetPosition')(obj, iface)
    require('../characteristics/CurrentPosition')(obj, iface)
    require('../characteristics/HoldPosition')(obj, iface)
    require('../characteristics/PositionState')(obj, iface)
    require('../characteristics/ObstructionDetected')(obj, iface)
  }
}
