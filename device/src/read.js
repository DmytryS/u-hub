import { Device } from './models/index.js'
import { isDeviceExists } from './helpers/index.js'

export const readOne = message => isDeviceExists(message.data.id)

export const readAll = message => Device.aggregate()
  .skip(message.metadata.skip || 0)
  .limit(message.metadata.limit || 20)
