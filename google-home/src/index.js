import './node_modules/dotenv/config.js.js'
import { inspect } from 'util'
import express from '../node_modules/@types/express'
import bodyParser from '../node_modules/@types/body-parser'
import cors from 'cors'
import ngrok from '../node_modules/ngrok/ngrok'
import actionsOnGoogle from '../node_modules/actions-on-google/dist'

import * as Firestore from './firestore.js.js.js'
import * as Auth from './auth-provider.js.js.js'
import * as Config from './config-provider.js.js.js'
import { logger, amqp } from './lib/index.js.js.js'

const { smarthome } = actionsOnGoogle

const {
  AMQP_GOOGLE_HOME_QUEUE,
  // AMQP_MQTT_LISTENER_QUEUE,
  AMQP_APOLLO_QUEUE,
} = process.env

const expressApp = express()
expressApp.use(cors())
expressApp.use(bodyParser.json())
expressApp.use(bodyParser.urlencoded({extended: true}))
expressApp.set('trust proxy', 1)

Auth.registerAuthEndpoints(expressApp)

let jwt
try {
  jwt = require('./smart-home-key.json.js.js')
} catch (e) {
  console.warn('Service account key is not found')
  console.warn('Report state and Request sync will be unavailable')
}

const app = smarthome({
  jwt,
  debug: true,
})

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const getUserIdOrThrow = async (headers) => {
  const userId = await Auth.getUser(headers)
  const userExists = await Firestore.userExists(userId)
  if (!userExists) {
    throw new Error(`User ${userId} has not created an account, so there are no devices`)
  }
  return userId
}

app.onSync(async (body, headers) => {
  const userId = await getUserIdOrThrow(headers)
  await Firestore.setHomegraphEnable(userId, true)

  const devices = await Firestore.getDevices(userId)
  return {
    requestId: body.requestId,
    payload: {
      agentUserId: userId,
      devices,
    },
  }
})

app.onQuery(async (body, headers) => {
  const userId = await getUserIdOrThrow(headers)
  const deviceStates = {}
  const {devices} = body.inputs[0].payload
  await asyncForEach(devices, async (device) => {
    const states = await Firestore.getState(userId, device.id)
    deviceStates[device.id] = states
  })
  return {
    requestId: body.requestId,
    payload: {
      devices: deviceStates,
    },
  }
})

app.onExecute(async (body, headers) => {
  const userId = await getUserIdOrThrow(headers)
  const commands= []
  const successCommand = {
    ids: [],
    status: 'SUCCESS',
    states: {},
  }

  const {devices, execution} = body.inputs[0].payload.commands[0]
  await asyncForEach(devices, async (device) => {
    try {
      const states = await Firestore.execute(userId, device.id, execution[0])
      successCommand.ids.push(device.id)
      successCommand.states = states

      // Report state back to Homegraph
      await app.reportState({
        agentUserId: userId,
        requestId: Math.random().toString(),
        payload: {
          devices: {
            states: {
              [device.id]: states,
            },
          },
        },
      })
      console.log('device state reported:', states)
    } catch (e) {
      if (e.message === 'pinNeeded') {
        commands.push({
          ids: [device.id],
          status: 'ERROR',
          errorCode: 'challengeNeeded',
          challengeNeeded: {
            type: 'pinNeeded',
          },
        })
        return
      } else if (e.message === 'challengeFailedPinNeeded') {
        commands.push({
          ids: [device.id],
          status: 'ERROR',
          errorCode: 'challengeNeeded',
          challengeNeeded: {
            type: 'challengeFailedPinNeeded',
          },
        })
        return
      } else if (e.message === 'ackNeeded') {
        commands.push({
          ids: [device.id],
          status: 'ERROR',
          errorCode: 'challengeNeeded',
          challengeNeeded: {
            type: 'ackNeeded',
          },
        })
        return
      }
      commands.push({
        ids: [device.id],
        status: 'ERROR',
        errorCode: e.message,
      })
    }
  })

  if (successCommand.ids.length) {
    commands.push(successCommand)
  }

  return {
    requestId: body.requestId,
    payload: {
      commands,
    },
  }
})

app.onDisconnect(async (body, headers) => {
  const userId = await getUserIdOrThrow(headers)
  await Firestore.disconnect(userId)
})

expressApp.post('/smarthome', app)

expressApp.post('/smarthome/update', async (req, res) => {
  console.log(req.body)
  const {userId, deviceId, name, nickname, states, localDeviceId, errorCode, tfa} = req.body
  try {
    await Firestore.updateDevice(userId, deviceId, name, nickname, states, localDeviceId,
      errorCode, tfa)
    if (localDeviceId || localDeviceId === null) {
      await app.requestSync(userId)
    }
    if (states !== undefined) {
      await app.reportState({
        agentUserId: userId,
        requestId: Math.random().toString(),
        payload: {
          devices: {
            states: {
              [deviceId]: states,
            },
          },
        },
      })
      console.log('device state reported:', states)
    }
    res.status(200).send('OK')
  } catch(e) {
    console.error(e)
    res.status(400).send(`Error updating device: ${e}`)
  }
})

expressApp.post('/smarthome/create', async (req, res) => {
  console.log('/smarthome/create', req.body)
  const {userId, data} = req.body
  
  try {
    await Firestore.addDevice(userId, data)
    await app.requestSync(userId)
  } catch(e) {
    console.error(e)
  } finally {
    res.status(200).send('OK')
  }
})

expressApp.post('/smarthome/delete', async (req, res) => {
  console.log(req.body)
  const {userId, deviceId} = req.body
  try {
    await Firestore.deleteDevice(userId, deviceId)
    await app.requestSync(userId)
  } catch(e) {
    console.error(e)
  } finally {
    res.status(200).send('OK')
  }
})

const appPort = process.env.PORT || Config.expressPort

const expressServer = expressApp.listen(appPort, async () => {
  const server = expressServer.address()
  const {address, port} = server

  console.log(`Smart home server listening at ${address}:${port}`)

  if (Config.useNgrok) {
    try {
      const url = await ngrok.connect(Config.expressPort)
      console.log('')
      console.log('COPY & PASTE NGROK URL BELOW')
      console.log(url)
      console.log('')
      console.log('=====')
      console.log('Visit the Actions on Google console at http://console.actions.google.com')
      console.log('Replace the webhook URL in the Actions section with:')
      console.log('    ' + url + '/smarthome')

      console.log('')
      console.log('In the console, set the Authorization URL to:')
      console.log('    ' + url + '/fakeauth')

      console.log('')
      console.log('Then set the Token URL to:')
      console.log('    ' + url + '/faketoken')
      console.log('')

      console.log('Finally press the \'TEST DRAFT\' button')
    } catch (err) {
      console.error('Ngrok was unable to start')
      console.error(err)
      process.exit()
    }
  }
})

const initSensors = async () => {
  // eslint-disable-next-line
  let { output: sensors } = await amqp.request(AMQP_APOLLO_QUEUE, {
    info: {
      operation: 'get-sensor'
    }
  })

  sensors = sensors.filter(s => !!s.name && !!s.type)

  sensors = sensors.map(sensor => ({
    id: sensor._id,
    // TODO: convert HomeKit typy to Google Home
    type: 'action.devices.types.OUTLET',
    traits: [ 'action.devices.traits.OnOff' ],
    defaultNames: [ 'Smart Outlet' ],
    name: sensor.name,
    nicknames: [ 'smart plug' ],
    roomHint: 'Basement',
    willReportState: true,
    states: { online: true, on: false },
    hwVersion: '1.0.0',
    swVersion: '2.0.0',
    model: 'L',
    manufacturer: 'L',
    deviceId: sensor._id,
    localDeviceExecution: false
  }))
  // console.log('###', sensors)
}

const listener = (message) => {
  logger.info(`MESSAGE: ${inspect(message, {depth: 7, colors: true})}`)
}

amqp.listen(AMQP_GOOGLE_HOME_QUEUE, listener)
initSensors()
