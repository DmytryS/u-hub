module.exports = function (iface) {
  const {logger, Service, Characteristic, amqp} = iface

  return function createService_AirPurifier(acc, settings, subtype) {
    if (typeof settings.payload.activeTrue === 'undefined') {
      settings.payload.activeTrue = true
    }

    if (typeof settings.payload.activeFalse === 'undefined') {
      settings.payload.activeFalse = false
    }

    const obj = {acc, settings, subtype}

    require('../characteristics')('CurrentAirPurifierState', obj, iface)
    require('../characteristics')('TargetAirPurifierState', obj, iface)

    require('../characteristics/Active')(obj, iface)
    require('../characteristics/RotationSpeed')(obj, iface)
    require('../characteristics/SwingMode')(obj, iface)
    require('../characteristics/LockPhysicalControls')(obj, iface)
  }
}
