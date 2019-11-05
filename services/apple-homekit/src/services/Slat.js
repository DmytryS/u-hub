module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_Slat(acc, settings, subtype) {
    acc.addService(Service.Slat, settings.name, subtype)

    const type = settings.config.SlatType || 0

    log.debug('> hap set', settings.name, 'SlatType', type)
    acc.getService(subtype)
      .setCharacteristic(Characteristic.SlatType, type)

    const obj = {acc, settings, subtype}

    require('../characteristics')('TargetTiltAngle', obj, iface)
    require('../characteristics')('CurrentTiltAngle', obj, iface)
    require('../characteristics')('CurrentSlatState', obj, iface)

    require('../characteristics/SwingMode')(obj, iface)
  }
}
