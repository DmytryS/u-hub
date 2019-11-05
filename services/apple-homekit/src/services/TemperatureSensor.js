module.exports = function (iface) {
  // eslint-disable-next-line
  const {accConfig, logger, Service, Characteristic,EventBridge} = iface

  return function createService_TemperatureSensor(acc) {
    acc.addService(Service.TemperatureSensor, accConfig.name, accConfig.id)

    require('../characteristics/CurrentTemperature')({acc}, iface)
    // require('../characteristics/StatusLowBattery')({acc}, iface)
    // require('../characteristics/StatusActive')({acc}, iface)
    // require('../characteristics/StatusFault')({acc}, iface)
    // require('../characteristics/StatusTampered')({acc}, iface)
  }
}
