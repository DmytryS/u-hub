import errors from 'restify-errors'
import { Device } from '../models/index.js'

// eslint-disable-next-line
export const isDeviceExists = async (deviceId) => {
  const device = await Device.findById(deviceId)
  if (!device) {
    throw new errors.NotFoundError(`Device with id ${deviceId} not found`)
  }
  return device
}
