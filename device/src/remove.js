import { isDeviceExists } from './helpers/index.js'

export default async function (data) {
  const deviceToRemove = await isDeviceExists(data.id)

  return deviceToRemove.remove()
}
