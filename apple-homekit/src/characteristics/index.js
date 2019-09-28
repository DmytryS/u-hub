module.exports = function (charName, obj, iface) {
  const {acc, settings, subtype} = obj
  const {mqttStatus, mqttPub, mqttSub, Characteristic, logger} = iface

  /* istanbul ignore if */
  if (!Characteristic[charName]) {
    throw new Error(`Unknown Characteristic ${charName}`)
  }

  let setTopic = 'set' + charName
  let statusTopic = 'status' + charName
  const topicShort = charName.replace(/^Set|^Status/, '')
  const setTopicShort = 'set' + topicShort
  const statusTopicShort = 'status' + topicShort

  if (setTopic !== setTopicShort && settings.topic[setTopicShort]) {
    setTopic = setTopicShort
  }

  /* istanbul ignore if */
  if (statusTopic !== statusTopicShort && settings.topic[statusTopicShort]) {
    statusTopic = statusTopicShort
  }

  const service = acc.getService(subtype)
  const characteristic = service.getCharacteristic(Characteristic[charName])

  if (settings.props && settings.props[charName]) {
    characteristic.setProps(settings.props[charName])
  }

  const {props, eventOnlyCharacteristic} = characteristic

  /* istanbul ignore else */
  if (props.perms.includes(Characteristic.Perms.PAIRED_READ) && settings.topic[statusTopic]) {
    mqttSub(settings.topic[statusTopic], settings.json[statusTopic], val => {
      logger.debug(`> hap update ${settings.name} ${charName} ${val}`)
      service.updateCharacteristic(Characteristic[charName], val)
    })

    /* istanbul ignore else */
    if (!eventOnlyCharacteristic) {
      characteristic.on('get', callback => {
        logger.debug(`< hap get ${settings.name} ${charName}`)
        logger.debug(`> hap re_get ${settings.name} ${charName} ${mqttStatus(settings.topic[statusTopic], settings.json[statusTopic])}`)
        callback(null, mqttStatus[settings.topic[statusTopic]])
      })
    }
  }

  /* istanbul ignore else */
  if (props.perms.includes(Characteristic.Perms.PAIRED_WRITE) && settings.topic[setTopic]) {
    characteristic.on('set', (value, callback) => {
      logger.debug(`< hap set ${settings.name} ${charName} ${value}`)
      mqttPub(settings.topic[setTopic], value, settings.mqttPublishOptions)
      callback()
    })
  }
}
