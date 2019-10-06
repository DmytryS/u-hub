module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_Switch(acc, settings, subtype) {
    acc.addService(Service.Switch, settings.name, subtype)

    require('../characteristics/On')({acc, settings, subtype}, iface)
  }
}
