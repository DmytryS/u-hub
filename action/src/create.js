import Action from './models/action.js'
import { isAutomaticActionExists, isScheduledActionExists, isSensorExists } from './helpers/index.js'

export default async (data) => {
  const emitterType = data.emitterType === 'AUTOMATIC' ? 'AutomaticAction' : 'ScheduledAction'

  if (emitterType === 'AutomaticAction') {
    await isAutomaticActionExists(data.emitter)
  } else {
    await isScheduledActionExists(data.emitter)
  }

  await isSensorExists(data.target)

  return new Action({
    ...data,
    emitterType,
  }).save()
}
