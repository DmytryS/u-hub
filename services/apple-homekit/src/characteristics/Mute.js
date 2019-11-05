module.exports = function (obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  acc.getService(subtype)
    .getCharacteristic(Characteristic.Mute)
    .on('set', (value, callback) => {
      logger.debug(`< hap set ${settings.name} Mute ${value}`)
      const mute = value ? settings.payload.muteTrue : settings.payload.muteFalse
      mqttPub(settings.topic.setMute, mute)
      callback()
    })

  /* istanbul ignore else */
  if (settings.topic.statusMute) {
    mqttSub(settings.topic.statusMute, settings.json.statusMute, val => {
      const mute = val === settings.payload.muteTrue
      logger.debug(`> hap update ${settings.name} Mute ${mute}`)
      acc.getService(subtype)
        .updateCharacteristic(Characteristic.Mute, mute)
    })
  }

  acc.getService(subtype)
    .getCharacteristic(Characteristic.Mute)
    .on('get', callback => {
      logger.debug(`< hap get', ${settings.name} Mute`)
      const mute = mqttStatus(settings.topic.statusMute, settings.json.statusMute) === settings.payload.muteTrue
      logger.debug(`> hap re_get ${settings.name} Mute ${mute}`)
      callback(null, mute)
    })
}
