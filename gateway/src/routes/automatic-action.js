import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/automatic_action')
  .get(resolver)
  .post(resolver)

router.route('/automatic_action/:actionId')
  .put(resolver)
  .delete(resolver)

export default router
