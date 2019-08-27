import {
  isActionExists,
  isScheduledActionExists,
  isAutomaticActionExists,
  isSensorExists,
} from './helpers/index.js'

export default async (data) => {
  const action = await isActionExists(data.id)

  const emitterType = data.emitterType === 'AUTOMATIC' ? 'AutomaticAction' : 'ScheduledAction'

  if (emitterType === 'AutomaticAction') {
    await isAutomaticActionExists(data.emitter)
  } else {
    await isScheduledActionExists(data.emitter)
  }

  await isSensorExists(data.target)

  Object.assign(action, data)

  return action.save()
}
