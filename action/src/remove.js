import { isActionExists } from './helpers/index.js'

export default async (data) => {
  const action = await isActionExists(data.id)

  return action.remove()
}
