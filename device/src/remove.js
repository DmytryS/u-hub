import { isDeviceExists } from './helpers';

export default async function (message) {
  const deviceToRemove = await isDeviceExists(message.data.id);

  return deviceToRemove.remove();
}
