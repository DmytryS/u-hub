import { Device } from './models'
import { isDeviceExists } from './helpers'

export const read_one = (message) => {
    return isDeviceExists(message.data.id)
}

export const read_all = (message) => {
    return Device.aggregate()
        .skip(message.metadata.skip || 0)
        .limit(message.metadata.limit || 20);
}
