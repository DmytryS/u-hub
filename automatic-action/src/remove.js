import { isAutomaticActionExists } from './helpers/index.js'

export default async (message) => {
  const automatiAction = await isAutomaticActionExists(message.data.id)

  return automatiAction.remove()
}
