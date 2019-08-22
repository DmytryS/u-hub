import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/devices/:deviceId/values')
  .get(resolver)

router.route('/devices/:deviceId/sensors/:sensorId/values')
  .post(resolver)
  .get(resolver)

export default router
