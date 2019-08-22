import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/scheduled-actions')
  .get(resolver)
  .post(resolver)

router.route('/scheduled-actions/:scheduledActionId')
  .put(resolver)
  .delete(resolver)

export default router
