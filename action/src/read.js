import Action from './models/action.js'
import { isActionExists } from './helpers/index.js'

export const readOne = message => isActionExists(message.data.id)

export const readAll = message => Action.find({ ...message.data })
