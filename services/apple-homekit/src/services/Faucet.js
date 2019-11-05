module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  /*
    // Required Characteristics
    this.addCharacteristic(Characteristic.Active);

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.Name);
    this.addOptionalCharacteristic(Characteristic.StatusFault);
    */

  return function createService_Faucet(acc, settings, subtype) {
    /* istanbul ignore else */
    if (typeof settings.payload.activeTrue === 'undefined') {
      settings.payload.activeTrue = true
    }

    /* istanbul ignore else */
    if (typeof settings.payload.activeFalse === 'undefined') {
      settings.payload.activeFalse = false
    }

    /* istanbul ignore if */
    if (typeof settings.payload.faultTrue === 'undefined') {
      settings.payload.faultTrue = true
    }

    acc.addService(Service.Faucet, settings.name, subtype)

    const obj = {acc, settings, subtype}

    require('../characteristics/Active')(obj, iface)
    require('../characteristics/StatusFault')(obj, iface)
  }
}
