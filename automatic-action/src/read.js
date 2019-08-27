import AutomaticAction from './models/action.js'
import { isAutomaticActionExists } from './helpers/index.js'

export const readOne = message => isAutomaticActionExists(message.data.id)

export const readAll = message => AutomaticAction.find({ ...message.data })
