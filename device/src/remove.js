import { isDeviceExists } from './helpers'

export default async function (message) {
    const deviceToRemove = await isDeviceExists(message.data.id)

    if (!deviceToRemove) {
        throw new NotFound(`Device with id ${message.data.id} not found`)
    }

    return deviceToRemove.remove()
}
