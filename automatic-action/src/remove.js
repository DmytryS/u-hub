import { isAutomaticActionExists } from './helpers/index.js'

export default async (data) => {
  const automatiAction = await isAutomaticActionExists(data.id)

  return automatiAction.remove()
}
