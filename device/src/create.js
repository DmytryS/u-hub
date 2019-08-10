import { Device } from './models';

export default async function (message) {
  return new Device(message.data).save();
}
