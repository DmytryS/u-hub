import Action from './models/action.js'
import { isActionExists } from './helpers/index.js'

export const readOne = data => isActionExists(data.id)

export const readAll = data => Action.find({ ...data })
