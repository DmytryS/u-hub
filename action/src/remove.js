import { isActionExists } from './helpers/index.js'

export default async (message) => {
  const action = await isActionExists(message.data.id)

  return action.remove()
}
