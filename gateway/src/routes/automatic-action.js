import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions')
  .get(resolver)
  .post(resolver)

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions/:actionId')
  .put(resolver)
  .delete(resolver)

export default router
