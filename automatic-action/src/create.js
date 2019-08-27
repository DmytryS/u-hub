import AutomaticAction from './models/automaticAction.js'
import { isSensorExists } from './helpers/index.js'

export default async (message) => {
  await isSensorExists(message.data.sensor)

  return new AutomaticAction({
    ...message.data,
  }).save()
}
