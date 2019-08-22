// import HAP from "hap-nodejs";
import 'dotenv/config.js'

import { logger } from './lib/index.js'

// const { uuid, Bridge, Accessory, Service, Characteristic } = HAP;

// const path = require('path');

import qrcode from 'qrcode-terminal'
// const oe = require("obj-ease");


import HAP from 'hap-nodejs'
import pkgHap from 'hap-nodejs/package.json'
// import pkg from '../package.json'

const { USERNAME, PORT, CODE, BRIDGENAME } = process.env

logger.info('HAP is starting')
// process.title = pkg.name


// function typeGuess(payload) {
//   let state;

//   if (payload === 'true') {
//     state = true;
//   } else if (payload === 'false') {
//     state = false;
//   } else if (isNaN(payload)) {
//     state = payload;
//   } else {
//     state = parseFloat(payload);
//   }
//   return state;
// }


logger.info('using hap-nodejs version', pkgHap.version)

const {
  uuid,
  Bridge,
  Accessory,
  // Service,
  // Characteristic
} = HAP

HAP.init(undefined) // config.storagedir ||

// Create Bridge which will host all Accessories
const bridgename = 'TEST_BRIDGE'
const bridge = new Bridge(bridgename, uuid.generate(bridgename))

bridge.on('identify', (paired, callback) => {
  logger.info('< hap bridge identify', paired ? '(paired)' : '(unpaired)')
  callback()
})


// function newAccessory(settings) {
//   logger.debug(
//     'creating new accessory',
//     `"${settings.name}"`,
//     `"${settings.id}"`,
//     uuid.generate(settings.id),
//   );
//   const acc = new Accessory(
//     settings.name,
//     uuid.generate(settings.id),
//     settings.category,
//   );
//   if (settings.manufacturer || settings.model || settings.serial) {
//     acc
//       .getService(Service.AccessoryInformation)
//       .setCharacteristic(
//         Characteristic.Manufacturer,
//         settings.manufacturer || '-',
//       )
//       .setCharacteristic(Characteristic.Model, settings.model || '-')
//       .setCharacteristic(Characteristic.SerialNumber, settings.serial || '-');
//   }
//   if (!settings.payload) {
//     settings.payload = {};
//   }
//   if (!settings.config) {
//     settings.config = {};
//   }
//   /* istanbul ignore next */
//   acc.on('identify', (paired, callback) => {
//     identify(settings, paired, callback);
//   });
//   return acc;
// }

// const addService = {};

// function loadService(service) {
//   const file = `services/${service}.js`;
//   logger.debug('loading', file);
//   addService[service] = require(path.join(__dirname, file))({
//     mqttPub,
//     mqttSub,
//     mqttStatus,
//     log,
//     Service,
//     Characteristic,
//     HAP,
//   });
// }

// let mapping;
// let accCount;

/* Convert old config file schema to keep compatiblity */
/* istanbul ignore next */
// function convertMapping() {
//   let isConverted;
//   Object.keys(mapping).forEach((id) => {
//     const accConfig = mapping[id];

//     if (!accConfig.services) {
//       accConfig.services = [];
//       isConverted = true;
//     }

//     if (accConfig.topic && accConfig.topic.identify) {
//       accConfig.topicIdentify = accConfig.topic.identify;
//       delete accConfig.topic.identify;
//       isConverted = true;
//     }

//     if (accConfig.payload && accConfig.payload.identify) {
//       accConfig.payloadIdentify = accConfig.payload.identify;
//       delete accConfig.payload.identify;
//       isConverted = true;
//     }

//     if (accConfig.service) {
//       accConfig.services.unshift({
//         name: accConfig.name,
//         service: accConfig.service,
//         topic: accConfig.topic || {},
//         payload: accConfig.payload || {},
//         config: accConfig.config || {},
//         props: accConfig.props || {},
//       });
//       delete accConfig.service;
//       delete accConfig.topic;
//       delete accConfig.payload;
//       delete accConfig.config;
//       delete accConfig.props;
//       isConverted = true;
//     }
//   });
//   if (isConverted) {
//     logger.info('mapping file converted');
//     saveMapping();
//   }
// }

// eslint-disable-next-line
function createBridge() {
  logger.info(
    'hap created',
    // accCount,
    'Camera Accessories and',
    // accCountBridged,
    'Bridged Accessories.',
  )

  bridge.publish({
    username: USERNAME,
    port: PORT,
    pincode: CODE,
    category: Accessory.Categories.OTHER,
  })
  logger.debug(
    `hap publishing bridge "${
      BRIDGENAME
    }" username=${
      USERNAME}`,
    `port=${PORT}`,
    `pincode=${CODE}`,
    `setupURI=${bridge.setupURI()}`,
  )

  // eslint-disable-next-line
  bridge._server.on('listening', () => {
    // const bridgeListening = true;
    // mqttPub(config.name + "/connected", "2", { retain: true });
    logger.info('hap Bridge listening on port', PORT)

    logger.info(
      '\nScan this code with your HomeKit app on your iOS device to pair with the bridge',
    )
    qrcode.generate(bridge.setupURI())
    logger.info(
      'Or enter this code with your HomeKit app on your iOS device to pair with homekit2mqtt:',
    )
    logger.info('code', 1, CODE)
  })

  // eslint-disable-next-line
  bridge._server.on('pair', (username) => {
    logger.info('hap bridge paired', username)
  })

  // eslint-disable-next-line
  bridge._server.on('unpair', (username) => {
    logger.info('hap bridge unpaired', username)
  })

  // eslint-disable-next-line
  bridge._server.on('verify', () => {
    logger.info('hap bridge verify')
  })
}


// createBridge();
