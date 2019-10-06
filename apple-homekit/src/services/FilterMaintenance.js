module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_FilterMaintenance(acc, settings, subtype) {
    acc.addService(Service.FilterMaintenance, settings.name, subtype)

    const obj = {acc, settings, subtype}

    require('../characteristics')('FilterChangeIndication', obj, iface)
    require('../characteristics')('FilterLifeLevel', obj, iface)
    require('../characteristics')('ResetFilterIndication', obj, iface)
  }
}
