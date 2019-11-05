module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  // eslint-disable-next-line
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore else */
  if (settings.topic.statusObstruction) {
    acc.getService(subtype)
      .getCharacteristic(Characteristic.ObstructionDetected)
      .on('get', callback => {
        logger.debug(`< hap get ${settings.name} ObstructionDetected`)
        const obstruction = mqttStatus(settings.topic.statusObstruction, settings.json.statusObstruction) === settings.payload.onObstructionDetected
        logger.debug(`> hap re_get ${settings.name} ObstructionDetected ${obstruction}`)
        callback(null, obstruction)
      })

    mqttSub(settings.topic.statusObstruction, settings.json.statusObstruction, val => {
      const obstruction = val === settings.payload.onObstructionDetected
      logger.debug(`> hap update ${settings.name} ObstructionDetected ${obstruction}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.ObstructionDetected, obstruction)
    })
  }
}
