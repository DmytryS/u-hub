module.exports = function (iface) {
  // eslint-disable-next-line
  const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface

  return function createService_OccupancySensor(acc, settings, subtype) {
    acc.addService(Service.OccupancySensor, settings.name, subtype)
      .getCharacteristic(Characteristic.OccupancyDetected)
      .on('get', callback => {
        log.debug('< hap get', settings.name, 'OccupancyDetected')
        const motion = mqttStatus(settings.topic.statusOccupancyDetected, settings.json.statusOccupancyDetected) === settings.payload.onOccupancyDetected

        log.debug('> hap re_get', settings.name, 'OccupancyDetected', motion ?
          Characteristic.OccupancyDetected.OCCUPANCY_DETECTED :
          Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED)
        callback(null, motion)
      })

    mqttSub(settings.topic.statusOccupancyDetected, settings.json.statusOccupancyDetected, val => {
      const motion = val === settings.payload.onOccupancyDetected
      log.debug('> hap update', settings.name, 'OccupancyDetected', motion)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.OccupancyDetected, motion ?
          Characteristic.OccupancyDetected.OCCUPANCY_DETECTED :
          Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED)
    })

    require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface)
    require('../characteristics/StatusActive')({acc, settings, subtype}, iface)
    require('../characteristics/StatusFault')({acc, settings, subtype}, iface)
    require('../characteristics/StatusTampered')({acc, settings, subtype}, iface)
  }
}
