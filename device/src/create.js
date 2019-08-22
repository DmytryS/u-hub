import { Device } from './models/index.js'

export default async function (message) {
  return new Device(message.data).save()
}
