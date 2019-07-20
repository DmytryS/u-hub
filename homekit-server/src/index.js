// import HAP from "hap-nodejs";
import "dotenv/config";

// const { uuid, Bridge, Accessory, Service, Characteristic } = HAP;

const path = require("path");

const qrcode = require("qrcode-terminal");
const nextport = require("nextport");
// const oe = require("obj-ease");


const HAP = require("hap-nodejs");
const pkgHap = require("hap-nodejs/package.json");
const pkg = require("../package.json");

import { logger } from './lib'

logger.info(pkg.name + " " + pkg.version + " starting");
process.title = pkg.name;



function typeGuess(payload) {
  let state;

  if (payload === "true") {
    state = true;
  } else if (payload === "false") {
    state = false;
  } else if (isNaN(payload)) {
    state = payload;
  } else {
    state = parseFloat(payload);
  }
  return state;
}


logger.info("using hap-nodejs version", pkgHap.version);

const { uuid, Bridge, Accessory, Service, Characteristic } = HAP;

HAP.init(undefined); //config.storagedir ||

// Create Bridge which will host all Accessories
const bridgename = "TEST_BRIDGE";
const bridge = new Bridge(bridgename, uuid.generate(bridgename));

bridge.on("identify", (paired, callback) => {
  logger.info("< hap bridge identify", paired ? "(paired)" : "(unpaired)");
  callback();
});


function newAccessory(settings) {
  logger.debug(
    "creating new accessory",
    '"' + settings.name + '"',
    '"' + settings.id + '"',
    uuid.generate(settings.id)
  );
  const acc = new Accessory(
    settings.name,
    uuid.generate(settings.id),
    settings.category
  );
  if (settings.manufacturer || settings.model || settings.serial) {
    acc
      .getService(Service.AccessoryInformation)
      .setCharacteristic(
        Characteristic.Manufacturer,
        settings.manufacturer || "-"
      )
      .setCharacteristic(Characteristic.Model, settings.model || "-")
      .setCharacteristic(Characteristic.SerialNumber, settings.serial || "-");
  }
  if (!settings.payload) {
    settings.payload = {};
  }
  if (!settings.config) {
    settings.config = {};
  }
  /* istanbul ignore next */
  acc.on("identify", (paired, callback) => {
    identify(settings, paired, callback);
  });
  return acc;
}

const addService = {};

function loadService(service) {
  const file = "services/" + service + ".js";
  logger.debug("loading", file);
  addService[service] = require(path.join(__dirname, file))({
    mqttPub,
    mqttSub,
    mqttStatus,
    log,
    Service,
    Characteristic,
    HAP
  });
}

let mapping;
let accCount;

/* Convert old config file schema to keep compatiblity */
/* istanbul ignore next */
function convertMapping() {
  let isConverted;
  Object.keys(mapping).forEach(id => {
    const accConfig = mapping[id];

    if (!accConfig.services) {
      accConfig.services = [];
      isConverted = true;
    }

    if (accConfig.topic && accConfig.topic.identify) {
      accConfig.topicIdentify = accConfig.topic.identify;
      delete accConfig.topic.identify;
      isConverted = true;
    }

    if (accConfig.payload && accConfig.payload.identify) {
      accConfig.payloadIdentify = accConfig.payload.identify;
      delete accConfig.payload.identify;
      isConverted = true;
    }

    if (accConfig.service) {
      accConfig.services.unshift({
        name: accConfig.name,
        service: accConfig.service,
        topic: accConfig.topic || {},
        payload: accConfig.payload || {},
        config: accConfig.config || {},
        props: accConfig.props || {}
      });
      delete accConfig.service;
      delete accConfig.topic;
      delete accConfig.payload;
      delete accConfig.config;
      delete accConfig.props;
      isConverted = true;
    }
  });
  if (isConverted) {
    logger.info("mapping file converted");
    saveMapping();
  }
}

function createBridge() {

  logger.info(
    "hap created",
    accCount,
    "Camera Accessories and",
    accCountBridged,
    "Bridged Accessories."
  );

  bridge.publish({
    username: process.env.USERNAME,
    port: process.env.PORT,
    pincode: process.env.CODE,
    category: Accessory.Categories.OTHER
  });
  logger.debug(
    'hap publishing bridge "' +
    process.env.BRIDGENAME +
    '" username=' +
    process.env.USERNAME,
    "port=" + process.env.PORT,
    "pincode=" + process.env.CODE,
    "setupURI=" + bridge.setupURI()
  );

  bridge._server.on("listening", () => {
    bridgeListening = true;
    // mqttPub(config.name + "/connected", "2", { retain: true });
    logger.info("hap Bridge listening on port", process.env.PORT);

    logger.info(
      "\nScan this code with your HomeKit app on your iOS device to pair with the bridge"
    );
    qrcode.generate(bridge.setupURI());
    logger.info(
      "Or enter this code with your HomeKit app on your iOS device to pair with homekit2mqtt:"
    );
    logger.info('code', 1, process.env.CODE)
  });

  bridge._server.on("pair", username => {
    logger.info("hap bridge paired", username);
  });

  /* istanbul ignore next */
  bridge._server.on("unpair", username => {
    logger.info("hap bridge unpaired", username);
  });

  /* istanbul ignore next */
  bridge._server.on("verify", () => {
    logger.info("hap bridge verify");
  });
}


createBridge();
