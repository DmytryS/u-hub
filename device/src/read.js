import { Device } from './models/index.js'
import { isDeviceExists } from './helpers/index.js'

export const readOne = data => isDeviceExists(data.id)

export const readAll = (data) => Device.find({ ...data })
