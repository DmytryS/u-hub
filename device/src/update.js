import { isDeviceExists } from './helpers/index.js'

export default async (message) => {
  const deviceToUpdate = await isDeviceExists(message.data.id)

  Object.assign(deviceToUpdate, message.data)

  return deviceToUpdate.save()
}
