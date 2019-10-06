module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_Outlet(acc, settings, subtype) {
    acc.addService(Service.Outlet, settings.name, subtype)

    acc.getService(subtype)
      .getCharacteristic(Characteristic.OutletInUse)
      .on('get', callback => {
        log.debug('< hap get', settings.name, 'OutletInUse')
        const inUse = mqttStatus(settings.topic.statusOutletInUse, settings.json.statusOutletInUse) === settings.payload.onOutletInUse
        log.debug('> hap re_get', settings.name, 'OutletInUse', inUse)
        callback(null, inUse)
      })

    mqttSub(settings.topic.statusOutletInUse, settings.json.statusOutletInUse, val => {
      const inUse = val === settings.payload.onOutletInUse
      log.debug('> hap update', settings.name, 'OutletInUse', inUse)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.OutletInUse, inUse)
    })

    require('../characteristics/On')({acc, settings, subtype}, iface)
  }
}
