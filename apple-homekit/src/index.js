import 'dotenv/config.js'
import { logger } from './lib/index.js.js'


import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import nextport from 'nextport'
import oe from 'obj-ease'

import HAP from 'hap-nodejs'
import pkgHap from 'hap-nodejs/package.json'
import pkg from '../package.json.js'

/* eslint-disable */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* eslint-enable */

const { BRIDGE_NAME, PORT, PIN_CODE, STORAGE_DIR, MAPPING } = process.env

logger.info(pkg.name + ' ' + pkg.version + ' starting')
process.title = pkg.name

const mqttStatusRaw = {} // Holds the payloads of the last-received message, keys are the topics.

function mqttStatus(topic, attr) { // Holds the payloads of the last-received message, keys are the topics.
  if (attr && typeof mqttStatusRaw[topic] === 'object') {
    return oe.getProp(mqttStatusRaw[topic], attr)
  }
  return mqttStatus[topic]
}

const mqttCallbacks = {} // Holds arrays of subscription callbacks, keys are the topics.

// const topics = []

// logger.info('mqtt trying to connect', config.url)
// const mqtt = Mqtt.connect(config.url, {
//   will: {topic: config.name + '/connected', payload: '0', retain: true},
//   rejectUnauthorized: !config.insecure
// })

// mqtt.on('connect', () => {
//   mqttConnected = true
//   logger.info('mqtt connected ' + config.url)
//   /* istanbul ignore next */
//   if (!bridgeListening) {
//     mqttPub(config.name + '/connected', '1', {retain: true})
//   }
// })

/* istanbul ignore next */
// mqtt.on('reconnect', () => {
//   logger.info('mqtt reconnect')
// })

/* istanbul ignore next */
// mqtt.on('offline', () => {
//   logger.info('mqtt offline')
// })

/* istanbul ignore next */
// mqtt.on('close', () => {
//   if (mqttConnected) {
//     mqttConnected = false
//     logger.info('mqtt closed ' + config.url)
//   }
// })

/* istanbul ignore next */
// mqtt.on('error', err => {
//   logger.error('mqtt error ' + err)
// })

function typeGuess(payload) {
  let state
  // Nasty type guessing.
  // TODO clarify Do we really want/need to cast the strings "true" and "false" to bool? https://github.com/hobbyquaker/homekit2mqtt/issues/66
  if (payload === 'true') {
    state = true
  } else if (payload === 'false') {
    state = false
  } else if (isNaN(payload)) {
    state = payload
  } else {
    state = parseFloat(payload)
  }
  return state
}

// MQTT subscribe function that provides a callback on incoming messages.
// Not meant to be used with wildcards!
function mqttSub(topic, /* string, optional, default "val" */ attr, callback) {
  topic = String(topic)
  /* istanbul ignore next */
  if (topic === '') {
    logger.error('trying to subscribe empty topic')
    return
  }
  /* istanbul ignore if */
  if (typeof attr === 'function') {
    callback = attr
    attr = 'val'
  } else if (attr) {
    attr = String(attr)
  } else {
    attr = 'val'
  }
  /* istanbul ignore else */
  if (typeof callback === 'function') {
    /* istanbul ignore if */
    if (mqttCallbacks[topic]) {
      mqttCallbacks[topic].push({attr, callback})
    } else {
      mqttCallbacks[topic] = [{attr, callback}]
      logger.debug('mqtt subscribe', topic)
      // mqtt.subscribe(topic)
    }
  } else {
    logger.debug('mqtt subscribe', topic)
    // mqtt.subscribe(topic)
  }
}

// MQTT publish function, checks for valid topic and converts payload to string in a meaningful manner.
function mqttPub(topic, payload, options) {
  /* istanbul ignore if */
  if (!topic || (typeof topic !== 'string')) {
    logger.error('mqttPub invalid topic', topic)
  } else {
    /* istanbul ignore if */
    if (typeof payload === 'object') {
      payload = JSON.stringify(payload)
      /* istanbul ignore next */
    } else if (typeof payload === 'undefined') {
      payload = ''
    } else if (typeof payload !== 'string') {
      payload = String(payload)
    }
    logger.debug(`> mqtt ${topic} ${payload}`)

    /* istanbul ignore if */
    // if (config.retain) {
    //   if (!options) {
    //     options = {}
    //   }
    //   options.retain = true
    // }
    // mqtt.publish(topic, payload, options, err => {
    //   /* istanbul ignore next */
    //   if (err) {
    //     logger.error('mqtt publish error ' + err)
    //   }
    // })
  }
}

logger.info('using hap-nodejs version', pkgHap.version)

const {uuid, Bridge, Accessory, Service, Characteristic} = HAP

/* istanbul ignore next */
if (STORAGE_DIR) {
  logger.info('using directory ' + STORAGE_DIR + ' for persistent storage')
}
// If storagedir is not set it uses HAP-Nodejs default
// (usually /usr/local/lib/node_modules/homekit2mqtt/node_modules/node-persist/persist)
HAP.init(undefined)

// Create Bridge which will host all Accessories
const bridge = new Bridge(BRIDGE_NAME, uuid.generate(BRIDGE_NAME))

// Listen for Bridge identification event
/* istanbul ignore next */
bridge.on('identify', (paired, callback) => {
  logger.info('< hap bridge identify', paired ? '(paired)' : '(unpaired)')
  callback()
})

// Handler for Accessory identification events
/* istanbul ignore next */
function identify(settings, paired, callback) {
  logger.debug('< hap identify', settings.name, paired ? '(paired)' : '(unpaired)')
  if (settings.topicIdentify) {
    logger.debug('> mqtt', settings.topicIdentify, settings.payloadIdentify)
    mqttPub(settings.topicIdentify, settings.payloadIdentify)
  }
  callback()
}

function mac(data) {
  const sha1sum = crypto.createHash('sha1')
  sha1sum.update(data)
  const s = sha1sum.digest('hex')
  let i = -1
  return 'xx:xx:xx:xx:xx:xx'.replace(/[x]/g, () => {
    i += 1
    return s[i]
  }).toUpperCase()
}

function newAccessory(settings) {
  logger.debug('creating new accessory', '"' + settings.name + '"', '"' + settings.id + '"', uuid.generate(settings.id))
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
  /* istanbul ignore next */
  acc.on('identify', (paired, callback) => {
    identify(settings, paired, callback)
  })
  return acc
}

const addService = {}

function loadService(service) {
  const file = 'services/' + service + '.js'
  logger.debug('loading', file)
  addService[service] = require(path.join(__dirname, file))({logger, Service, Characteristic, HAP})
}

let mapping
let accCount

/* Convert old config file schema to keep compatiblity */
/* istanbul ignore next */
function convertMapping() {
  let isConverted
  Object.keys(mapping).forEach(id => {
    const accConfig = mapping[id]

    if (!accConfig.services) {
      accConfig.services = []
      isConverted = true
    }

    if (accConfig.topic && accConfig.topic.identify) {
      accConfig.topicIdentify = accConfig.topic.identify
      delete accConfig.topic.identify
      isConverted = true
    }

    if (accConfig.payload && accConfig.payload.identify) {
      accConfig.payloadIdentify = accConfig.payload.identify
      delete accConfig.payload.identify
      isConverted = true
    }

    if (accConfig.service) {
      accConfig.services.unshift({
        name: accConfig.name,
        service: accConfig.service,
        topic: accConfig.topic || {},
        payload: accConfig.payload || {},
        config: accConfig.config || {},
        props: accConfig.props || {}
      })
      delete accConfig.service
      delete accConfig.topic
      delete accConfig.payload
      delete accConfig.config
      delete accConfig.props
      isConverted = true
    }
  })
  if (isConverted) {
    logger.info('mapping file converted')
    saveMapping()
  }
}

function createBridge() {
  // mqtt.on('message', (topic, payload) => {
  //   payload = payload.toString()
  //   let json
  //   // if (payload.indexOf('{') !== -1 && !config.disableJsonParse) {
  //   //   try {
  //   //     json = JSON.parse(payload)
  //   //   } catch (err) {}
  //   // }
  //   const state = typeGuess(payload)
  //   logger.debug('< mqtt', topic, state, payload)

  //   mqttStatusRaw[topic] = json || state
  //   mqttStatus[topic] = (json && typeof json.val !== 'undefined') ? json.val : state

  //   /* istanbul ignore else */
  //   if (mqttCallbacks[topic]) {
  //     mqttCallbacks[topic].forEach(obj => {
  //       const {attr, callback} = obj
  //       /* istanbul ignore else */
  //       if (typeof callback === 'function') {
  //         /* istanbul ignore else */
  //         if (attr) {
  //           callback(json ? oe.getProp(json, attr) : state)
  //         } else {
  //           callback(state)
  //         }
  //       }
  //     })
  //   }
  //   // Topics array Used for autocomplete in web ui)
  //   if (topics.indexOf(topic) === -1 && topic !== (pkg.name + '/connected')) {
  //     topics.push(topic)
  //   }
  // })

  // Load and create all accessories
  // logger.info('loading HomeKit to MQTT mapping file ' + config.mapfile)

  
  // mapping = JSON.parse(fs.readFileSync(path.join(__dirname, '..', MAPPING)))
  // convertMapping()
  // accCount = 0
  // let accCountBridged = 0
  // Object.keys(mapping).forEach(id => {
  //   const accConfig = mapping[id]
  //   accConfig.id = id
  //   const acc = newAccessory(accConfig)

  //   let cam = false
  //   const camName = accConfig.name
  //   accConfig.services.forEach((s, i) => {
  //     if (s.service === 'CameraRTSPStreamManagement') {
  //       cam = true
  //     }
  //     if (!addService[s.service]) {
  //       loadService(s.service)
  //     }
  //     if (!s.json) {
  //       s.json = {}
  //     }
  //     logger.debug('adding service', s.service, 'to accessory', accConfig.name)
  //     addService[s.service](acc, s, String(i))
  //   })

  //   if (cam) {
  //     nextport(PORT, port => {
  //       const username = mac(acc.UUID)
  //       logger.debug('hap publishing camera accessory ' + accConfig.name)
  //       acc.publish({
  //         username,
  //         port,
  //         pincode: PIN_CODE,
  //         category: Accessory.Categories.CAMERA
  //       })

  //       logger.debug('hap publishing camera accessory "' + camName + '" username=' + username, 'port=' + port,
  //         'pincode=' + PIN_CODE, 'setupURI=' + acc.setupURI())
  //       acc._server.on('listening', () => {
  //         // bridgeListening = true
  //         mqttPub(pkg.name + '/connected', '2', {retain: true})
  //         logger.info('hap camera', camName, 'listening on port', port)

  //         console.log('  \nScan this code with your HomeKit app on your iOS device to pair with', camName)
  //         qrcode.generate(acc.setupURI())
  //         console.log('  ')
  //       })

  //       /* istanbul ignore next */
  //       acc._server.on('pair', username => {
  //         logger.info('hap camera', camName, 'paired', username)
  //       })

  //       /* istanbul ignore next */
  //       acc._server.on('unpair', username => {
  //         logger.info('hap camera', camName, 'unpaired', username)
  //       })

  //       /* istanbul ignore next */
  //       acc._server.on('verify', () => {
  //         logger.info('hap camera', camName, 'verify')
  //       })
  //     })
  //     accCount++
  //   } else {
  //     logger.debug('addBridgedAccessory ' + accConfig.name)
  //     bridge.addBridgedAccessory(acc)
  //     accCountBridged++
  //   }
  // })
  // logger.info('hap created', accCount, 'Camera Accessories and', accCountBridged, 'Bridged Accessories.')


  bridge.publish({
    username: generateUniqueUsername(BRIDGE_NAME),
    port: parseInt(PORT),
    pincode: PIN_CODE,

    category: Accessory.Categories.BRIDGE
  })
  logger.debug(`hap publishing bridge "${pkg.name}" username=${BRIDGE_NAME} port=${PORT} pincode=${PIN_CODE} setupURI=${bridge.setupURI()}`)

  bridge._server.on('listening', () => {
    // bridgeListening = true
    // mqttPub(pkg.name + '/connected', '2', {retain: true})
    logger.info(`hap Bridge listening on port ${PORT}`)

    logger.info('\nScan this code with your HomeKit app on your iOS device to pair with the bridge')
    qrcode.generate(bridge.setupURI())
    logger.info('Or enter this code with your HomeKit app on your iOS device to pair with homekit2mqtt:')
    logger.info(chalk.black.bgWhite('                       '))
    logger.info(chalk.black.bgWhite('    ┌────────────┐     '))
    logger.info(chalk.black.bgWhite('    │ ' + PIN_CODE + ' │     '))
    logger.info(chalk.black.bgWhite('    └────────────┘     '))
    logger.info(chalk.black.bgWhite('                       '))
    logger.info('')
  })

  bridge._server.on('pair', username => {
    logger.info('hap bridge paired', username)
  })

  /* istanbul ignore next */
  bridge._server.on('unpair', username => {
    logger.info('hap bridge unpaired', username)
  })

  /* istanbul ignore next */
  bridge._server.on('verify', () => {
    logger.info('hap bridge verify')
  })
}

function saveMapping() {
  fs.writeFileSync(MAPPING, JSON.stringify(mapping, null, '  '))
  logger.info('saved config to', MAPPING)
}

function generateUniqueUsername(name) {
  let shasum = crypto.createHash('sha1')
  shasum.update(name);
  let hash = shasum.digest('hex');

  const username = `${hash[0]}${hash[1]}:${hash[2]}${hash[3]}:${hash[4]}${hash[5]}:${hash[6]}${hash[7]}:${hash[8]}${hash[9]}:${hash[10]}${hash[11]}`;

  return username.toUpperCase()
};

createBridge()

