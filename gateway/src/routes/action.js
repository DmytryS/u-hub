import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/actions')
  .get(resolver)
  .post(resolver)

router.route('/actions/:actionId')
  .put(resolver)
  .delete(resolver)

export default router
