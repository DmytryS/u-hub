module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  settings.topic.statusLock = settings.topic.statusLock || settings.topic.statusLockCurrentState

  /* istanbul ignore if */
  if (typeof settings.payload.lockUnknown === 'undefined') {
    settings.payload.lockUnknown = 3
  }
  /* istanbul ignore if */
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

  let initial = true

  const service = acc.getService(subtype)

  /* istanbul ignore else */
  if (settings.topic.statusLock) {
    mqttSub(settings.topic.statusLock, settings.json.statusLock, val => {
      if (val === settings.payload.lockSecured) {
        logger.debug(`> hap update ${settings.name} LockCurrentState.SECURED`)
        service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED)
        if (initial) {
          service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED)
          initial = false
        }
      } else if (val === settings.payload.lockJammed) {
        logger.debug(`> hap update ${settings.name} LockCurrentState.JAMMED`)
        service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.JAMMED)
        if (initial) {
          service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.JAMMED)
          initial = false
        }
      } else if (val === settings.payload.lockUnknown) {
        logger.debug(`> hap update ${settings.name} LockCurrentState.UNKNOWN`)
        service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNKNOWN)
        if (initial) {
          service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.UNKNOWN)
          initial = false
        }
      } else /* if (val === settings.payload.lockUnsecured) */ {
        logger.debug(`> hap update ${settings.name} LockCurrentState.UNSECURED`)
        service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED)
        if (initial) {
          service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.UNSECURED)
          initial = false
        }
      }
    })

    service.getCharacteristic(Characteristic.LockCurrentState)
      .on('get', callback => {
        logger.debug('< hap get', settings.name, 'LockCurrentState')

        if (mqttStatus(settings.topic.statusLock, settings.json.statusLock) === settings.payload.lockSecured) {
          logger.debug(`> hap re_get ${settings.name} LockCurrentState.SECURED`)
          callback(null, Characteristic.LockCurrentState.SECURED)
        } else if (mqttStatus(settings.topic.statusLock, settings.json.statusLock) === settings.payload.lockJammed) {
          logger.debug(`> hap re_get ${settings.name} LockCurrentState.JAMMED`)
          callback(null, Characteristic.LockCurrentState.JAMMED)
        } else if (mqttStatus(settings.topic.statusLock, settings.json.statusLock) === settings.payload.lockUnknwon) {
          logger.debug(`> hap re_get ${settings.name} LockCurrentState.UNKNOWN`)
          callback(null, Characteristic.LockCurrentState.UNKNOWN)
        } else if (mqttStatus(settings.topic.statusLock, settings.json.statusLock) === settings.payload.lockUnsecured) {
          logger.debug(`> hap re_get ${settings.name} LockCurrentState.UNSECURED`)
          callback(null, Characteristic.LockCurrentState.UNSECURED)
        }
      })
  }
}
