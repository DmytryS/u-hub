import errors from 'restify-errors'
import { ScheduledAction } from '../models/index.js'

// eslint-disable-next-line
export const isScheduledActionExists = async (scheduledActionId) => {
  const scheduledAction = await ScheduledAction.findById(scheduledActionId)
  if (!scheduledAction) {
    throw new errors.NotFoundError(`Scheduled Action with id ${scheduledActionId} not found`)
  }

  return scheduledAction
}
