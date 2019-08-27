import {
  isAutomaticActionExists,
  isSensorExists,
} from './helpers/index.js'

export default async (message) => {
  const automaticAction = await isAutomaticActionExists(message.data.id)

  if (message.data.sensor) {
    await isSensorExists(message.data.sensor)
  }

  Object.assign(automaticAction, message.data)

  return automaticAction.save()
}
