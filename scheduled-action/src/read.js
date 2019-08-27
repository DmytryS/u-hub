import { ScheduledAction } from './models/index.js'
import { isScheduledActionExists } from './helpers/index.js'

export const readOne = data => isScheduledActionExists(data.id)

export const readAll = data => ScheduledAction.find({ ...data })
