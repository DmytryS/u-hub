import { Device } from './models/index.js'
import { isDeviceExists } from './helpers/index.js'

export const readOne = message => isDeviceExists(message.data.id)

export const readAll = (message) => Device.find({ ...message.data })
