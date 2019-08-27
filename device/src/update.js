import { isDeviceExists } from './helpers/index.js'

export default async (data) => {
  const deviceToUpdate = await isDeviceExists(data.id)

  Object.assign(deviceToUpdate, data)

  return deviceToUpdate.save()
}
