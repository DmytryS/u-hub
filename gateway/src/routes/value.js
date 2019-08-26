import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/device/:deviceId/values')
  .get(resolver)

router.route('/device/:deviceId/sensors/:sensorId/values')
  .post(resolver)
  .get(resolver)

export default router
