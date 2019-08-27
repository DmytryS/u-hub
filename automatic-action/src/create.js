import AutomaticAction from './models/automaticAction.js'
import { isSensorExists } from './helpers/index.js'

export default async (data) => {
  await isSensorExists(data.sensor)

  return new AutomaticAction({
    ...data,
  }).save()
}
