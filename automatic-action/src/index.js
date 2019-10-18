import 'dotenv/config.js'
import { logger, amqp } from './lib/index.js'
import { inspect } from 'util'

const {
  AMQP_APOLLO_QUEUE,
  AMQP_AUTOMATIC_ACTION_QUEUE,
  AMQP_MQTT_LISTENER_QUEUE
} = process.env

const listener = async (message) => {
  logger.info(`MESSAGE: ${inspect(message, {depth: 7, colors: true})}`)

  const currentValue = message.input.device.sensor.value

  const { output: automaticActions } = await amqp.request(
    AMQP_APOLLO_QUEUE,
    {
      info: {
        operation: 'get-automatic-actions'
      },
      input: {
        device: {
          name: message.input.device.name,
          sensor: {
            type: message.input.device.sensor.type
          }
        }
      }
    }
  )

  const actionIds = automaticActions
    .flatMap(automaticAction => {
      let actions

      switch(automaticAction.condition){
        case 'LESS':
          actions = automaticAction.valueToCompare < currentValue ? automaticAction.actions: [false]
          break
        case 'MORE':
          actions = automaticAction.valueToCompare > currentValue ? automaticAction.actions: [false]
          break
        case 'MORE_OR_EQUAL':
          actions = automaticAction.valueToCompare >= currentValue ? automaticAction.actions: [false]
          break
        case 'LESS_OR_EQUAL':
          actions = automaticAction.valueToCompare <= currentValue ? automaticAction.actions: [false]
          break
        case 'NOT_EQUAL':
          actions = automaticAction.valueToCompare !== currentValue ? automaticAction.actions: [false]
          break
        case 'EQUAL':
          actions = automaticAction.valueToCompare === currentValue ? automaticAction.actions: [false]
          break
      }

      return actions
    })
    .filter(automaticAction => !!automaticAction)

  // console.log('AUTOMATIC_ACTIONS:', inspect(automaticActions,{depth:7, colors: true}))

  const { output: actions } = await amqp.request(
    AMQP_APOLLO_QUEUE,
    {
      info: {
        operation: 'get-actions'
      },
      input: {
        action: actionIds
      }
    }
  )

  // console.log('ACTIONS:', inspect(actions,{depth:7, colors: true}))

  const { output: sensors } = await amqp.request(
    AMQP_APOLLO_QUEUE,
    {
      info: {
        operation: 'get-sensor'
      },
      input: {
        sensor: actions.map(a => a.sensor)
      }
    }
  )
  
  const { output: devices } = await amqp.request(
    AMQP_APOLLO_QUEUE,
    {
      info: {
        operation: 'get-device'
      },
      input: {
        device: sensors.map(s => s.device)
      }
    }
  )
  
  // console.log('DEVICES:', inspect(devices,{depth:7, colors: true}))

  await Promise.all(sensors.map(s => amqp.request(
    AMQP_MQTT_LISTENER_QUEUE,
    {
      info: {
        operation: 'set-value'
      },
      input: {
        device: {
          name: devices.find(d => d._id === s.device).name,
          sensor: {
            type: s.type,
            value: actions.find(a => a.sensor === s._id).valueToChangeOn
          }
        }
      }
    }
  )))
    
}

amqp.listen(AMQP_AUTOMATIC_ACTION_QUEUE, listener)
