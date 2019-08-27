import { Device } from './models/index.js'

export default function (message) {
  return new Device({ ...message.data }).save()
}
