module.exports = function (iface) {
  const {mqttPub, mqttSub, mqttStatus, logger, Service, Characteristic} = iface

  return function createService_Door(acc, settings, subtype) {
    acc.addService(Service.Door, settings.name, subtype)

    const obj = {acc, settings, subtype}

    require('../characteristics/TargetPosition')(obj, iface)
    require('../characteristics/CurrentPosition')(obj, iface)
    require('../characteristics/HoldPosition')(obj, iface)
    require('../characteristics/PositionState')(obj, iface)
    require('../characteristics/ObstructionDetected')(obj, iface)
  }
}
