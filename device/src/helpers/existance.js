import { Device } from '../models'

import { NotFoundError } from 'restify errors'

export const isDeviceExists = (deviceId) => {
    const device = await Device.findById(deviceId);
    if (!device) {
        throw new NotFoundError(`Device with id ${nodeId} not found`);
    }
    return device;
}
