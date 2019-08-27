import {
  isAutomaticActionExists,
  isSensorExists,
} from './helpers/index.js'

export default async (data) => {
  const automaticAction = await isAutomaticActionExists(data.id)

  if (data.sensor) {
    await isSensorExists(data.sensor)
  }

  Object.assign(automaticAction, data)

  return automaticAction.save()
}
