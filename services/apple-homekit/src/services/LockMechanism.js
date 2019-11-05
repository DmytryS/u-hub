module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_LockMechanism(acc, settings, subtype) {
    acc.addService(Service.LockMechanism, settings.name, subtype)

    const obj = {acc, settings, subtype}

    require('../characteristics/LockTargetState')(obj, iface)
    require('../characteristics/LockCurrentState')(obj, iface)
  }
}
