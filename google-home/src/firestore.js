import admin from 'firebase-admin'
import {googleCloudProjectId} from './config-provider.js'
import serviceAccount from './smart-home-key.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), //admin.credential.applicationDefault(),
  databaseURL: `https://${googleCloudProjectId}.firebaseio.com`,
})

const db = admin.firestore()
const settings = {timestampsInSnapshots: true}
db.settings(settings)

export async function userExists(userId) {
  const userDoc = await db.collection('users').doc(userId).get()
  return userDoc.exists
}

export async function getUserId(accessToken) {
  const querySnapshot = await db.collection('users')
    .where('fakeAccessToken', '==', accessToken).get()
  if (querySnapshot.empty) {
    throw new Error('No user found for this access token')
  }
  const doc = querySnapshot.docs[0]
  return doc.id // This is the user id in Firestore
}

export async function homegraphEnabled(userId) {
  const userDoc = await db.collection('users').doc(userId).get()
  return userDoc.data() ? userDoc.data().homegraph : false
}

export async function setHomegraphEnable(userId, enable) {
  await db.collection('users').doc(userId).update({
    homegraph: enable,
  })
}

export async function updateDevice(userId, deviceId, name, nickname, states, localDeviceId, errorCode, tfa) {
  // Payload can contain any state data
  // tslint:disable-next-line
  const updatePayload = {}
  if (name) {
    updatePayload['name'] = name
  }
  if (nickname) {
    updatePayload['nicknames'] = [nickname]
  }
  if (states) {
    updatePayload['states'] = states
  }
  if (localDeviceId === null) { // null means local execution has been disabled.
    updatePayload['otherDeviceIds'] = admin.firestore.FieldValue.delete()
  } else if (localDeviceId !== undefined) { // undefined means localDeviceId was not updated.
    updatePayload['otherDeviceIds'] = [{deviceId: localDeviceId}]
  }
  if (errorCode) {
    updatePayload['errorCode'] = errorCode
  } else if (!errorCode) {
    updatePayload['errorCode'] = ''
  }
  if (tfa) {
    updatePayload['tfa'] = tfa
  } else if (tfa !== undefined) {
    updatePayload['tfa'] = ''
  }
  await db.collection('users')
    .doc(userId)
    .collection('devices')
    .doc(deviceId)
    .update(updatePayload)
}

export async function addDevice(userId, data) {
  await db.collection('users').doc(userId).collection('devices').doc(data.id).set(data)
}

export async function deleteDevice(userId, deviceId) {
  await db.collection('users').doc(userId).collection('devices').doc(deviceId).delete()
}

export async function getDevices(userId) {
  const devices = []
  const querySnapshot = await db.collection('users').doc(userId).collection('devices').get()

  querySnapshot.forEach(doc => {
    const data = doc.data()
    const device = {
      id: data.id,
      type: data.type,
      traits: data.traits,
      name: {
        defaultNames: data.defaultNames,
        name: data.name,
        nicknames: data.nicknames,
      },
      deviceInfo: {
        manufacturer: data.manufacturer,
        model: data.model,
        hwVersion: data.hwVersion,
        swVersion: data.swVersion,
      },
      willReportState: data.willReportState,
      attributes: data.attributes,
      otherDeviceIds: data.otherDeviceIds,
      customData: data.customData,
    }
    devices.push(device)
  })

  return devices
}

export async function getState(userId, deviceId) {

  const doc = await db.collection('users').doc(userId)
    .collection('devices').doc(deviceId).get()

  if (!doc.exists) {
    throw new Error('deviceNotFound')
  }

  return doc.data() ? doc.data().states : false
}

export async function execute(userId, deviceId, execution) {
  const doc = await db.collection('users').doc(userId).collection('devices').doc(deviceId).get()

  if (!doc.exists) {
    throw new Error('deviceNotFound')
  }

  const states = {
    online: true,
  }
  const data = doc.data()
  if (data && data.states.online) {
    throw new Error('deviceOffline')
  }
  if (data && data.errorCode) {
    throw new Error(data && data.errorCode)
  }
  if (data && data.tfa === 'ack' && !execution.challenge) {
    throw new Error('ackNeeded')
  } else if (data && data.tfa && !execution.challenge) {
    throw new Error('pinNeeded')
  } else if (data && data.tfa && execution.challenge) {
    if (execution.challenge.pin && data && execution.challenge.pin !== data.tfa) {
      throw new Error('challengeFailedPinNeeded')
    }
  }
  switch (execution.command) {
    // action.devices.traits.ArmDisarm
    case 'action.devices.commands.ArmDisarm':
      if (execution.params.arm !== undefined) {
        states.isArmed = execution.params.arm
      } else if (execution.params.cancel) {
        // Cancel value is in relation to the arm value
        states.isArmed = data ? !data.states.isArmed : false
      }
      if (execution.params.armLevel) {
        await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
          'states.isArmed': states.isArmed || data && data.states.isArmed,
          'states.currentArmLevel': execution.params.armLevel,
        })
        states['currentArmLevel'] = execution.params.armLevel
      } else {
        await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
          'states.isArmed': states.isArmed || data && data.states.isArmed,
        })
      }
      break

    // action.devices.traits.Brightness
    case 'action.devices.commands.BrightnessAbsolute':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.brightness': execution.params.brightness,
      })
      states['brightness'] = execution.params.brightness
      break

    // action.devices.traits.CameraStream
    case 'action.devices.commands.GetCameraStream':
      states['cameraStreamAccessUrl'] = 'https://fluffysheep.com/baaaaa.mp4'
      break

    // action.devices.traits.ColorSetting
    case 'action.devices.commands.ColorAbsolute':
      // eslint-disable-next-line
      let color = {}
      if (execution.params.color.spectrumRGB) {
        await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
          'states.color': {
            spectrumRgb: execution.params.color.spectrumRGB,
          },
        })
        color = {
          spectrumRgb: execution.params.color.spectrumRGB,
        }
      } else if (execution.params.color.spectrumHSV) {
        await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
          'states.color': {
            spectrumHsv: execution.params.color.spectrumHSV,
          },
        })
        color = {
          spectrumHsv: execution.params.color.spectrumHSV,
        }
      } else if (execution.params.color.temperature) {
        await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
          'states.color': {
            temperatureK: execution.params.color.temperature,
          },
        })
        color = {
          temperatureK: execution.params.color.temperature,
        }
      } else {
        throw new Error('notSupported')
      }
      states['color'] = color
      break

    // action.devices.traits.Dock
    case 'action.devices.commands.Dock':
      // This has no parameters
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.isDocked': true,
      })
      states['isDocked'] = true
      break

    // action.devices.traits.FanSpeed
    case 'action.devices.commands.SetFanSpeed':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.currentFanSpeedSetting': execution.params.fanSpeed,
      })
      states['currentFanSpeedSetting'] = execution.params.fanSpeed
      break

    case 'action.devices.commands.Reverse':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.currentFanSpeedReverse': true,
      })
      break

    // action.devices.traits.Locator
    case 'action.devices.commands.Locate':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.silent': execution.params.silent,
        'states.generatedAlert': true,
      })
      states['generatedAlert'] = true
      break

    // action.devices.traits.LockUnlock
    case 'action.devices.commands.LockUnlock':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.isLocked': execution.params.lock,
      })
      states['isLocked'] = execution.params.lock
      break

    // action.devices.traits.Modes
    case 'action.devices.commands.SetModes':
      // eslint-disable-next-line
      const currentModeSettings = data && data.states.currentModeSettings
      for (const mode of Object.keys(execution.params.updateModeSettings)) {
        const setting = execution.params.updateModeSettings[mode]
        currentModeSettings[mode] = setting
      }
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.currentModeSettings': currentModeSettings,
      })
      states['currentModeSettings'] = currentModeSettings
      break

    // action.devices.traits.OnOff
    case 'action.devices.commands.OnOff':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.on': execution.params.on,
      })
      states['on'] = execution.params.on
      break

    // action.devices.traits.OpenClose
    case 'action.devices.commands.OpenClose':
      // Check if the device can open in multiple directions
      if (data && data.attributes && data.attributes.openDirection) {
        // The device can open in more than one direction
        const direction = execution.params.openDirection

        data.states.openState.forEach((state) => {
          if (state.openDirection === direction) {
            state.openPercent = execution.params.openPercent
          }
        })
        await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
          'states.openState': data.states.openState,
        })
      } else {
        // The device can only open in one direction
        await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
          'states.openPercent': execution.params.openPercent,
        })
        states['openPercent'] = execution.params.openPercent
      }
      break

    // action.devices.traits.RunCycle - No execution
    // action.devices.traits.Scene
    case 'action.devices.commands.ActivateScene':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.deactivate': execution.params.deactivate,
      })
      // Scenes are stateless
      break

    // action.devices.traits.StartStop
    case 'action.devices.commands.StartStop':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.isRunning': execution.params.start,
      })
      states['isRunning'] = execution.params.start
      states['isPaused'] = data && data.states.isPaused
      break

    case 'action.devices.commands.PauseUnpause':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.isPaused': execution.params.pause,
      })
      states['isPaused'] = execution.params.pause
      states['isRunning'] = data && data.states.isRunning
      break

    // action.devices.traits.TemperatureControl
    case 'action.devices.commands.SetTemperature':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.temperatureSetpointCelsius': execution.params.temperature,
      })
      states['temperatureSetpointCelsius'] = execution.params.temperature
      states['temperatureAmbientCelsius'] = data && data.states.temperatureAmbientCelsius
      break

    // action.devices.traits.TemperatureSetting
    case 'action.devices.commands.ThermostatTemperatureSetpoint':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.thermostatTemperatureSetpoint': execution.params.thermostatTemperatureSetpoint,
      })
      states['thermostatTemperatureSetpoint'] = execution.params.thermostatTemperatureSetpoint
      states['thermostatMode'] = data && data.states.thermostatMode
      states['thermostatTemperatureAmbient'] = data && data.states.thermostatTemperatureAmbient
      states['thermostatHumidityAmbient'] = data && data.states.thermostatHumidityAmbient
      break

    case 'action.devices.commands.ThermostatTemperatureSetRange':
      // eslint-disable-next-line
      const {
        thermostatTemperatureSetpointLow,
        thermostatTemperatureSetpointHigh,
      } = execution.params
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.thermostatTemperatureSetpointLow': thermostatTemperatureSetpointLow,
        'states.thermostatTemperatureSetpointHigh': thermostatTemperatureSetpointHigh,
      })
      states['thermostatTemperatureSetpoint'] = data && data.states.thermostatTemperatureSetpoint
      states['thermostatMode'] = data && data.states.thermostatMode
      states['thermostatTemperatureAmbient'] = data && data.states.thermostatTemperatureAmbient
      states['thermostatHumidityAmbient'] = data && data.states.thermostatHumidityAmbient
      break

    case 'action.devices.commands.ThermostatSetMode':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.thermostatMode': execution.params.thermostatMode,
      })
      states['thermostatMode'] = execution.params.thermostatMode
      states['thermostatTemperatureSetpoint'] = data && data.states.thermostatTemperatureSetpoint
      states['thermostatTemperatureAmbient'] = data && data.states.thermostatTemperatureAmbient
      states['thermostatHumidityAmbient'] = data && data.states.thermostatHumidityAmbient
      break

    // action.devices.traits.Timer
    case 'action.devices.commands.TimerStart':
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.timerRemainingSec': execution.params.timerTimeSec,
      })
      states['timerRemainingSec'] = execution.params.timerTimeSec
      break

    case 'action.devices.commands.TimerAdjust':
      if (data && data.states.timerRemainingSec === -1) {
        // No timer exists
        throw new Error('noTimerExists')
      }
      // eslint-disable-next-line
      const newTimerRemainingSec = data && (data.states.timerRemainingSec + execution.params.timerTimeSec)
      if (newTimerRemainingSec < 0) {
        throw new Error('valueOutOfRange')
      }
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.timerRemainingSec': newTimerRemainingSec,
      })
      states['timerRemainingSec'] = newTimerRemainingSec
      break

    case 'action.devices.commands.TimerPause':
      if (data && data.states.timerRemainingSec === -1) {
        // No timer exists
        throw new Error('noTimerExists')
      }
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.timerPaused': true,
      })
      states['timerPaused'] = true
      break

    case 'action.devices.commands.TimerResume':
      if (data && data.states.timerRemainingSec === -1) {
        // No timer exists
        throw new Error('noTimerExists')
      }
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.timerPaused': false,
      })
      states['timerPaused'] = false
      break

    case 'action.devices.commands.TimerCancel':
      if (data && data.states.timerRemainingSec === -1) {
        // No timer exists
        throw new Error('noTimerExists')
      }
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.timerRemainingSec': -1,
      })
      states['timerRemainingSec'] = 0
      break

    // action.devices.traits.Toggles
    case 'action.devices.commands.SetToggles':
      // eslint-disable-next-line
      const currentToggleSettings = data && data.states.currentToggleSettings
      for (const toggle of Object.keys(execution.params.updateToggleSettings)) {
        const enable = execution.params.updateToggleSettings[toggle]
        currentToggleSettings[toggle] = enable
      }
      await db.collection('users').doc(userId).collection('devices').doc(deviceId).update({
        'states.currentToggleSettings': currentToggleSettings,
      })
      states['currentToggleSettings'] = currentToggleSettings
      break

    default:
      throw new Error('actionNotAvailable')
  }

  return states
}

export async function disconnect(userId) {
  await setHomegraphEnable(userId, false)
}
