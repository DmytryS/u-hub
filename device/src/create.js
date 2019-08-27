import { Device } from './models/index.js'

export default function (data) {
  return new Device({ ...data }).save()
}
