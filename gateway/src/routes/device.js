import express from 'express'
import resolver from '../resolver.js'

const router = express.Router()

router.route('/device')
  .get(resolver)



// router.route('/devices/:deviceId/sensors/:sensorId/type/:type/change-control-type')
//   .post(this._nodeService.changeControlType);

// router.route('/devices/:deviceId/sensors/:sensorId')
//   .get(this._nodeService.getSensorInfo);


// router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions/:actionId/devices/:actiondeviceId')
//   .post(this._nodeService.updateActionNode)
//   .delete(this._nodeService.deleteActionNode);


// router.route('/scheduled-actions/:schedulerId/nodes')
//   .get(this._nodeService.getActionNodes)
//   .post(this._nodeService.createActionNode);

export default router
