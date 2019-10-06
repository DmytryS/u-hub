module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  // eslint-disable-next-line
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore else */
  if (settings.topic.statusPositionState) {
    mqttSub(settings.topic.statusPositionState, settings.json.statusPositionState, val => {
      let state
      if (val === settings.payload.positionStatusDecreasing) {
        state = Characteristic.PositionState.DECREASING
        logger.debug(`> hap update ${settings.name} PositionState.DECREASING`)
      } else if (val === settings.payload.positionStatusIncreasing) {
        state = Characteristic.PositionState.INCREASING
        logger.debug(`> hap update ${settings.name} PositionState.INCREASING`)
      } else {
        state = Characteristic.PositionState.STOPPED
        logger.debug(`> hap update ${settings.name} PositionState.STOPPED`)
      }
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.PositionState, state)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.PositionState)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} PositionState`)

        if (mqttStatus(settings.topic.statusPositionState, settings.json.statusPositionState) === settings.payload.positionStatusDecreasing) {
          logger.debug(`> hap re_get ${settings.name} PositionState.DECREASING`)
          callback(null, Characteristic.PositionState.DECREASING)
        } else if (mqttStatus(settings.topic.statusPositionState, settings.json.statusPositionState) === settings.payload.positionStatusIncreasing) {
          logger.debug(`> hap re_get ${settings.name} PositionState.INCREASING`)
          callback(null, Characteristic.PositionState.INCREASING)
        } else {
          logger.debug(`> hap re_get ${settings.name} PositionState.STOPPED`)
          callback(null, Characteristic.PositionState.STOPPED)
        }
      })
  }
}
