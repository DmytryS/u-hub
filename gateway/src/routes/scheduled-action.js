import express from 'express'

import { scheduledAction } from '../services'

const router = express.Router()

router.route('/scheduled-actions')
  .get(scheduledAction.getScheduledActions)
  .post(scheduledAction.creteScheduledAction)

router.route('/scheduled-actions/:scheduledActionId')
  .put(scheduledAction.updateScheduledAction)
  .delete(scheduledAction.deleteScheduledAction)

export default router
