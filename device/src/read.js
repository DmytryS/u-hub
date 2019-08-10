import { Device } from './models';
import { isDeviceExists } from './helpers';

export const readOne = message => isDeviceExists(message.data.id);

export const readAll = message => Device.aggregate()
  .skip(message.metadata.skip || 0)
  .limit(message.metadata.limit || 20);
