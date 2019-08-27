import AutomaticAction from './models/action.js'
import { isAutomaticActionExists } from './helpers/index.js'

export const readOne = data => isAutomaticActionExists(data.id)

export const readAll = data => AutomaticAction.find({ ...data })
