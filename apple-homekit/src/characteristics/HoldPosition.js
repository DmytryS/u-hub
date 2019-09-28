module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  if (settings.topic.setHoldPosition) {
    acc.getService(subtype)
      .getCharacteristic(Characteristic.HoldPosition)
      .on('set', (value, callback) => {
        logger.debug(`< hap set ${settings.name} HoldPosition ${value}`)
        if (typeof settings.payload.holdPositionTrue !== 'undefined' && value) {
          value = settings.payload.holdPositionTrue
        } else if (typeof settings.payload.holdPositionFalse !== 'undefined' && !value) {
          value = settings.payload.holdPositionFalse
        }
        logger.debug(`> mqtt', ${settings.topic.setHoldPosition} ${value}`)
        mqttPub(settings.topic.setHoldPosition, value)
        callback()
      })
  }
}
