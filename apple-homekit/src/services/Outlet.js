// const { AMQP_APOLLO_QUEUE } = process.env

module.exports = function (iface) {
  // eslint-disable-next-line
  const {
    logger,
    Service,
    Characteristic,
    accConfig,
    EventBridge,
    getSensorStatus
  } = iface

  return function createService_Outlet(acc) {
    acc.addService(Service.Outlet, accConfig.name, accConfig.id)
    acc.getService(accConfig.id)
      .getCharacteristic(Characteristic.OutletInUse)
      .on('get', callback => {
        logger.info('< hap get', accConfig.name, 'OutletInUse')
        const inUse = getSensorStatus(accConfig.id) === 1
        logger.info('> hap re_get', accConfig.name, 'OutletInUse', inUse)
        callback(null, inUse)
      })

    EventBridge.on(accConfig.id, val => {
      const inUse = val === 1
      logger.info('> hap update', accConfig.name, 'OutletInUse', inUse)
      acc.getService(accConfig.id)
        .updateCharacteristic(Characteristic.OutletInUse, inUse)
    })
  
    require('../characteristics/On')({acc}, iface)
  }
}
