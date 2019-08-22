import { isScheduledActionExists } from './helpers/index.js'

export default async function (message) {
  const deviceToRemove = await isScheduledActionExists(message.data.id)

  return deviceToRemove.remove()
}
