import 'dotenv/config.js'
import { amqp, logger, scheduler } from './lib/index.js'

const {
  AMQP_APOLLO_QUEUE,
  AMQP_MQTT_LISTENER_QUEUE,
  AMQP_SCHEDULED_ACTION_QUEUE,
} = process.env

const applyAction = (scheduledActionId) => async () => {
  try{
    let { output: scheduledAction } = await amqp.request(
      AMQP_APOLLO_QUEUE,
      {
        info: {
          operation: 'get-scheduled-actions'
        },
        input: {
          scheduledAction: scheduledActionId
        }
        
      }
    )

    scheduledAction = scheduledAction[0]

    if (scheduledAction && scheduledAction.actions) {
      const { output: actions } = await amqp.request(
        AMQP_APOLLO_QUEUE,
        {
          info: {
            operation: 'get-actions'
          },
          input: {
            action: scheduledAction.actions
          }
        }
      )

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
  
      await Promise.all(sensors.map(s => amqp.publish(
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
  }catch(err) {
    logger.error(`[SCHEDULE-JOB] ${err}`)
  }
}

const initJobs = async () => {
  logger.info('Reinitializing jobs')
  const { output: scheduledActions } = await amqp.request(
    AMQP_APOLLO_QUEUE,
    {
      info: {
        operation: 'get-scheduled-actions'
      }
    }
  )

  for (const scheduledAction of scheduledActions) {
    scheduler.scheduleJob(scheduledAction, applyAction(scheduledAction._id))
  }
}

initJobs()

const reinitializeJobs = (message) => {
  if (message.info.operation === 'reinitialize-jobs') {
    scheduler.stopJobs()
    initJobs()
  }
}

amqp.listen(AMQP_SCHEDULED_ACTION_QUEUE, reinitializeJobs)