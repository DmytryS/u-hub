import express from 'express';

import { values } from '../services';

const router = express.Router();

router.route('/devices/:deviceId/values')
  .get(values.getLastDeviceValues);

router.route('/devices/:deviceId/sensors/:sensorId/values')
  .post(values.setDeviceValue)
  .get(values.getDetailedValues);

export default router;
