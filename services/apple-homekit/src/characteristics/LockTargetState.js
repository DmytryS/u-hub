module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  // eslint-disable-next-line
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  settings.topic.setLock = settings.topic.setLock || settings.topic.setLockTargetState

  /* istanbul ignore else */
  if (typeof settings.payload.lockUnknown === 'undefined') {
    settings.payload.lockUnknown = 3
  }
  /* istanbul ignore else */
  if (typeof settings.payload.lockJammed === 'undefined') {
    settings.payload.lockJammed = 2
  }
  /* istanbul ignore if */
  if (typeof settings.payload.lockSecured === 'undefined') {
    settings.payload.lockSecured = 1
  }
  /* istanbul ignore if */
  if (typeof settings.payload.lockUnsecured === 'undefined') {
    settings.payload.lockUnsecured = 0
  }

  acc.getService(subtype)
    .getCharacteristic(Characteristic.LockTargetState)
    .on('set', (value, callback) => {
      logger.debug(`< hap set ${settings.name} LockTargetState ${value}`)

      /* istanbul ignore else */
      if (value === Characteristic.LockTargetState.UNSECURED) {
        mqttPub(settings.topic.setLock, settings.payload.lockUnsecured)
        callback()
      } else if (value === Characteristic.LockTargetState.SECURED) {
        mqttPub(settings.topic.setLock, settings.payload.lockSecured)
        callback()
      }
    })
}
