import { ScheduledAction } from './models/index.js'

export default async function (data) {
  return new ScheduledAction({ ...data }).save()
}
