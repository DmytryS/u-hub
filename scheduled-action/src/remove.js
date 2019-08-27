import { isScheduledActionExists } from './helpers/index.js'

export default async function (data) {
  const deviceToRemove = await isScheduledActionExists(data.id)

  return deviceToRemove.remove()
}
