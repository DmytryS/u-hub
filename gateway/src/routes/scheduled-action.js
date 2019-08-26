import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/scheduled_action')
  .get(resolver)
  .post(resolver)

router.route('/scheduled_action/:scheduledActionId')
  .put(resolver)
  .delete(resolver)

export default router
