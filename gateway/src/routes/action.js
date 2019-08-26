import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/action')
  .get(resolver)
  .post(resolver)

router.route('/action/:actionId')
  .put(resolver)
  .delete(resolver)

export default router
