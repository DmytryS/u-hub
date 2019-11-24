import 'dotenv/config.js'
import { logger, amqp } from './lib/index.js'
import jwt from 'jsonwebtoken'
import axios from'axios'

// import uuid from 'uuid/v4.js'
// import util from 'util'

import serviceAcc from './smart-home-key.json'

const {
  ACCESS_TOKEN_RENEW_INTERVAL,
  AMQP_GOOGLE_HOME_QUEUE,
  AMQP_APOLLO_QUEUE,
} = process.env

// let ACCESSORIES = []

let ACCESS_TOKEN = ''

const newAccessToken = async () => {
  let claims = {}

  //issued at, expiry time and issuer will be handled by jwt lib

  claims['scope'] = 'https://www.googleapis.com/auth/homegraph'
  claims['aud'] = 'https://accounts.google.com/o/oauth2/token'

  const token = jwt.sign(claims, serviceAcc.private_key, {
    expiresIn: parseInt(ACCESS_TOKEN_RENEW_INTERVAL),
    algorithm: 'RS256',
    issuer: serviceAcc.client_email
  })

  try {
    const response = await axios
      .post(
        'https://accounts.google.com/o/oauth2/token',
        'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' +
      token,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Bearer ' + token
          }
        }
      )

    if (!('access_token' in response.data)) {
      logger.info('[NewAccessToken] Key "access_token" was not in response data')
      return
    }
    ACCESS_TOKEN = response.data.access_token
    logger.info('[NewAccessToken] Successfully generated new access token!')
  } catch(err) {
    logger.error(`[NewAccessToken] error: ${err}`)
  }
}

//Periodically create a new access token, after (less than) half of expiry period
setInterval(newAccessToken, (parseInt(ACCESS_TOKEN_RENEW_INTERVAL) - 2) * 500)

// const reportState = async (userid, data) => {
//   try {
//     const response = await axios
//       .post(
//         'https://homegraph.googleapis.com/v1/devices:reportStateAndNotification',
//         data,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: 'Bearer ' + ACCESS_TOKEN,
//             'X-GFE-SSL': 'yes'
//           }
//         }
//       )


//     console.log('[Report State]  Response: ' + console.log(util.inspect(response, false, null)))

//   }catch (error) {
//     logger.error(`[Report State] HTTP error (user ${userid}): ${error}`)
//   }
// }


const initSensors = async () => {
//   bridge.removeBridgedAccessories(ACCESSORIES)
//   ACCESSORIES = []
  
  let { output: sensors } = await amqp.request(AMQP_APOLLO_QUEUE, {
    info: {
      operation: 'get-sensor'
    }
  })

  //   console.log('====', sensors)
  
  
  sensors = sensors.filter(s => !!s.name && !!s.type)
  
  sensors.map(sensor => {
    console.log('###', sensor)
    

    // const accConfig = {
    //   id: sensor._id,
    //   mqttStatusTopic: sensor.mqttStatusTopic,
    //   mqttSetTopic: sensor.mqttSetTopic,
    //   name: sensor.name,
    //   category: sensor.type
    // }
    // const acc = createAccessory(accConfig)
  
    // ACCESSORIES.push(acc)
    // logger.debug('adding service', accConfig.service, 'to accessory', accConfig.name)
    // addService[s.service](acc, s, String(i))
  
    // services[accConfig.category]({
    //   accConfig,
    //   logger,
    //   amqp,
    //   getSensorStatus,
    //   Service,
    //   Characteristic,
    //   HAP,
    //   EventBridge
    // })(acc)
  
    // bridge.addBridgedAccessory(acc)
  
    // logger.info(`Added  ${accConfig.category} ${acc.displayName}`)
  })
}

const listener = () => {
  console.log(ACCESS_TOKEN) // TODO
    
}




const createBridge = async () => {
  await newAccessToken()
  amqp.listen(AMQP_GOOGLE_HOME_QUEUE, listener)

  await initSensors()
}

createBridge()
