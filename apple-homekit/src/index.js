import 'dotenv/config.js'
import crypto from 'crypto'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import { loadServices } from './helpers/index.js'
import { logger, amqp } from './lib/index.js'
import HAP from 'hap-nodejs'
// import { inspect } from 'util'

const {
  BRIDGE_NAME,
  PORT,
  PIN_CODE,
  AMQP_APPLE_HOMEKIT_QUEUE,
  AMQP_APOLLO_QUEUE,
} = process.env

logger.info('Starting')

const services = loadServices()

const { uuid, Bridge, Accessory, Service, Characteristic } = HAP

HAP.init()

const identify = (settings, paired, callback) => {
  logger.debug(`< hap identify' ${settings.name, paired ? '(paired)' : '(unpaired)'}`)
  if (settings.topicIdentify) {
    logger.debug(`> mqtt ${settings.topicIdentify} ${settings.payloadIdentify}`)
    // mqttPub(settings.topicIdentify, settings.payloadIdentify)
  }
  callback()
}

const createAccessory = (settings) => {
  logger.debug(`creating new accessory ${settings.name} ${settings.id} ${uuid.generate(settings.id)}`)
  const acc = new Accessory(settings.name, uuid.generate(settings.id), settings.category)
  if (settings.manufacturer || settings.model || settings.serial) {
    acc.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, settings.manufacturer || '-')
      .setCharacteristic(Characteristic.Model, settings.model || '-')
      .setCharacteristic(Characteristic.SerialNumber, settings.serial || '-')
  }
  if (!settings.payload) {
    settings.payload = {}
  }
  if (!settings.config) {
    settings.config = {}
  }

  acc.on('identify', (paired, callback) => {
    identify(settings, paired, callback)
  })

  return acc
}

const mac = (data) => {
  const sha1sum = crypto.createHash('sha1')
  sha1sum.update(data)
  const s = sha1sum.digest('hex')
  let i = -1
  return 'xx:xx:xx:xx:xx:xx'.replace(/[x]/g, () => {
    i += 1
    return s[i]
  }).toUpperCase()
}

const initSensors = (bridge) => async () => {
  // console.log('SERVICES', services)

  let { output: sensors } = await amqp.request(AMQP_APOLLO_QUEUE, {
    info: {
      operation: 'get-sensor'
    }
  })

  sensors = sensors.filter(s => !!s.name && !!s.type)

  sensors.map(sensor => {
    const accConfig = {
      id: sensor._id,
      name: `${sensor.type} ${sensor._id.slice(-4)}`,
      category: sensor.type
    }
    const acc = createAccessory(accConfig)

    services[accConfig.category](acc, accConfig)

    logger.debug(`addBridgedAccessory ${accConfig.name}`)

    bridge.addBridgedAccessory(acc)
  })
}

const bridge = new Bridge(BRIDGE_NAME, uuid.generate(BRIDGE_NAME))

bridge.on('identify', (paired, callback) => {
  logger.info(`< hap bridge identify ${paired ? '(paired)' : '(unpaired)'}`)
  callback()
})

const createBridge = async () => {
  amqp.listen(AMQP_APPLE_HOMEKIT_QUEUE, initSensors(bridge))

  await initSensors(bridge)()
 
  bridge.publish({
    username: mac(BRIDGE_NAME),
    port: PORT,
    pincode: PIN_CODE,
    category: Accessory.Categories.BRIDGE
  })

  logger.debug(`hap publishing bridge ${BRIDGE_NAME} port=${PORT} pincode=${PIN_CODE} setupURI=${bridge.setupURI()}`)

  bridge._server.on('listening', () => {
    logger.info('hap Bridge listening on port', PORT)

    logger.info('\nScan this code with your HomeKit app on your iOS device to pair with the bridge')
    qrcode.generate(bridge.setupURI())
    logger.info('Or enter this code with your HomeKit app on your iOS device to pair with homekit2mqtt:')
    console.log(chalk.black.bgWhite('                       '))
    console.log(chalk.black.bgWhite('    ┌────────────┐     '))
    console.log(chalk.black.bgWhite(`    │ ${PIN_CODE} │     `))
    console.log(chalk.black.bgWhite('    └────────────┘     '))
    console.log(chalk.black.bgWhite('                       '))
    console.log('')
  })

  bridge._server.on('pair', username => {
    logger.info('hap bridge paired', username)
  })

  bridge._server.on('unpair', username => {
    logger.info('hap bridge unpaired', username)
  })

  bridge._server.on('verify', () => {
    logger.info('hap bridge verify')
  })
}

createBridge()
