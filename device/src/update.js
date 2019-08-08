import { isDeviceExists } from './helpers'

export default async (message) => {
    const deviceToUpdate = await isDeviceExists(message.data.id)

    deviceToUpdate.name = message.data.name
    deviceToUpdate.registered = true;

    return deviceToUpdate.save()
}
