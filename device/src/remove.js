import { isDeviceExists } from './helpers/index.js'

export default async function (message) {
  const deviceToRemove = await isDeviceExists(message.data.id)

  return deviceToRemove.remove()
}
