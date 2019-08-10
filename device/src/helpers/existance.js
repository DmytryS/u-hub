import { NotFoundError } from 'restify-errors';
import { Device } from '../models';

// eslint-disable-next-line
export const isDeviceExists = async (deviceId) => {
  const device = await Device.findById(deviceId);
  if (!device) {
    throw new NotFoundError(`Device with id ${deviceId} not found`);
  }
  return device;
};
