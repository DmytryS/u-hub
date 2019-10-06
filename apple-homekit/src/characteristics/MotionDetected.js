module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  // eslint-disable-next-line
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  acc.getService(subtype)
    .getCharacteristic(Characteristic.MotionDetected)
    .on('get', callback => {
      logger.debug(`< hap get ${settings.name} MotionDetected`)
      const motion = mqttStatus(settings.topic.statusMotionDetected, settings.json.statusMotionDetected) === settings.payload.onMotionDetected

      logger.debug(`> hap re_get ${settings.name} MotionDetected ${motion}`)
      callback(null, motion)
    })

  mqttSub(settings.topic.statusMotionDetected, settings.json.statusMotionDetected, val => {
    const motion = val === settings.payload.onMotionDetected
    logger.debug(`> hap update  ${settings.name} MotionDetected ${motion}`)
    acc.getService(subtype)
      .updateCharacteristic(Characteristic.MotionDetected, motion)
  })
}
