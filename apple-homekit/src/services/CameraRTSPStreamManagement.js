module.exports = function (iface) {
//   const {HAP, mqttPub, mqttSub, mqttStatus, logger, Service, Characteristic} = iface
//   const {FFMPEG} = require('homebridge-camera-ffmpeg/ffmpeg')

  //   function logger(...args) {
  //     let str = args.join(' ')
  //     if (str.match(/^(error: )/i)) {
  //       str = str.replace(/^error: (.*)/i, '$1')
  //       logger.error(str)
  //     } else {
  //       logger.debug(str)
  //     }
  //   }

  //   return function createService_CameraRTSPStreamManagement(acc, settings, subtype) {
  //     const config = {
  //       name: settings.name,
  //       videoConfig: {
  //         source: settings.config.source,
  //         stillImageSource: settings.config.stillImageSource || undefined,
  //         maxStreams: settings.config.maxStreams || 2,
  //         maxWidth: settings.config.maxWidth || 1280,
  //         maxHeight: settings.config.maxHeight || 720,
  //         maxFPS: settings.config.maxFPS || 10,
  //         debug: settings.config.debug,
  //         vcodec: settings.config.vcodec || 'libx264',
  //         audio: settings.config.audio,
  //         packetSize: settings.config.packetSize || 1316,
  //         maxBitrate: settings.config.maxBitrate || 300
  //       }
  //     }

//     const cameraSource = new FFMPEG(HAP, config, logger, settings.config.videoProcessor || 'ffmpeg')
//     acc.configureCameraSource(cameraSource)
//   }
}
