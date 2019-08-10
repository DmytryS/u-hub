import express from 'express';

const router = express.Router();

router.route('/nodes')
  .get(this._nodeService.getNodes);

router.route('/devices/:deviceId/sensors/:sensorId/values')
  .get(this._nodeService.getLastNodeValues);

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/values')
  .post(this._nodeService.createNodeValue)
  .get(this._nodeService.getDetailedValues);

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/change-control-type')
  .post(this._nodeService.changeControlType);

router.route('/devices/:deviceId/sensors/:sensorId/type/:type')
  .get(this._nodeService.getSensorInfo);

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions')
  .get(this._nodeService.getAutomaticActions)
  .post(this._nodeService.createAutomaticAction);

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions/:actionId')
  .post(this._nodeService.updateAutomaticAction)
  .delete(this._nodeService.deleteAutomaticAction);

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions/:actionId/nodes')
  .get(this._nodeService.getActionNodes)
  .post(this._nodeService.createActionNode);

router.route('/devices/:deviceId/sensors/:sensorId/type/:type/actions/:actionId/devices/:actiondeviceId')
  .post(this._nodeService.updateActionNode)
  .delete(this._nodeService.deleteActionNode);

router.route('/scheduled-actions')
  .get(this._nodeService.getScheduledActions)
  .post(this._nodeService.createScheduledAction);

router.route('/scheduled-actions/:schedulerId')
  .post(this._nodeService.updateScheduledAction)
  .delete(this._nodeService.deleteScheduledAction);

router.route('/scheduled-actions/:schedulerId/nodes')
  .get(this._nodeService.getActionNodes)
  .post(this._nodeService.createActionNode);


export default router;
