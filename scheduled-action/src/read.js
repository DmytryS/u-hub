import { ScheduledAction } from './models/index.js'
import { isScheduledActionExists } from './helpers/index.js'

export const readOne = message => isScheduledActionExists(message.data.id)

export const readAll = message => ScheduledAction.aggregate()
  .skip(message.metadata.skip || 0)
  .limit(message.metadata.limit || 20)
