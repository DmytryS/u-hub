import express from 'express'

import { automaticAction } from '../services'

const router = express.Router()

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions')
  .get(automaticAction.getAutomaticActions)
  .post(automaticAction.createAutomaticAction)

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions/:actionId')
  .put(automaticAction.updateAutomaticAction)
  .delete(automaticAction.deleteAutomaticAction)

export default router
