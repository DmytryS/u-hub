import { isScheduledActionExists } from './helpers/index.js'

export default async (data) => {
  const scheduledAction = await isScheduledActionExists(data.id)

  Object.assign(scheduledAction, data)

  return scheduledAction.save()
}
