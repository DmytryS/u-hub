module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  // eslint-disable-next-line
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  settings.payload.currentPositionFactor = settings.payload.currentPositionFactor || 1

  /* istanbul ignore else */
  if (settings.topic.statusCurrentPosition) {
    mqttSub(settings.topic.statusCurrentPosition, settings.json.statusCurrentPosition, val => {
      const position = Math.round(val / settings.payload.currentPositionFactor)
      logger.debug(`> hap update ${settings.name} CurrentPosition ${position}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.CurrentPosition, position)
    })
    acc.getService(subtype)
      .getCharacteristic(Characteristic.CurrentPosition)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} CurrentPosition`)
        const position = Math.round(mqttStatus(settings.topic.statusCurrentPosition, settings.json.statusCurrentPosition) / settings.payload.currentPositionFactor)
        logger.debug(`> hap re_get ${settings.name} 'CurrentPosition ${position}`)
        callback(null, position)
      })
  }
}
