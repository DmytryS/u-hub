import { ScheduledAction } from './models/index.js'

export default async function (message) {
  return new ScheduledAction(message.data).save()
}
