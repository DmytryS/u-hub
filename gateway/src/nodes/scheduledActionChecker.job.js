import mqttClient from "mqtt";
import scheduler from "../lib/scheduler/scheduler";

/**
 * Returns executor job
 * @param {Object} config configuration
 * @param {ScheduledActionModel} scheduledActionModel quiz attempt model
 * @param {ActionNodeModel} actionNodeModel action node model
 * @param {NodeModel} nodeModel node model
 * @param {SensorModel} sensorModel sensor model
 * @return {ScheduledActionCheckerJob} attempt checker job
 */
export default function scheduledActiontCheckerJob(
  config,
  scheduledActionModel,
  actionNodeModel,
  nodeModel,
  sensorModel
) {
  return new ScheduledActionCheckerJob(
    config,
    scheduledActionModel,
    actionNodeModel,
    nodeModel,
    sensorModel
  );
}
scheduledActiontCheckerJob.$inject = [
  "config",
  "scheduledActionModel",
  "actionNodeModel",
  "nodeModel",
  "sensorModel"
];

/**
 * Responsible for executing scheduled actions checking
 */
export class ScheduledActionCheckerJob {
  /**
   * Scheduled actions checker job
   * @param {Object} config configuration
   * @param {ScheduledActionModel} scheduledActionModel quiz attempt model
   * @param {ActionNodeModel} actionNodeModel action node model
   * @param {NodeModel} nodeModel node model
   * @param {SensorModel} sensorModel sensor model
   */
  constructor(
    config,
    scheduledActionModel,
    actionNodeModel,
    nodeModel,
    sensorModel
  ) {
    this._config = config;
    this._scheduler = new scheduler();
    this._scheduledActionModel = scheduledActionModel;
    this._actionNodeModel = actionNodeModel;
    this._nodeModel = nodeModel;
    this._sensorModel = sensorModel;
    this._mqttClient = mqttClient.connect(
      `mqtt://127.0.0.1:${this._config.mosca.port}`,
      { clientId: "ScheduledActionCheckerJob" }
    );

    this._initJobs();
  }

  async _initJobs() {
    const scheduledActions = await this._scheduledActionModel.ScheduledAction.enabledScheduledActionsCursor();
    scheduledActions.forEach(action => {
      this._scheduler.scheduleJob(
        action.schedule,
        this._applyScheduledAction.bind(this, action)
      );
    });
  }

  stopJobs() {
    this._scheduler.stopJobs();
  }

  async _applyScheduledAction(scheduledAction) {
    const actionNodes = await this._actionNodeModel.ActionNode.findActionNodesByEmitterIdAndType(
      scheduledAction._id,
      "SCHEDULED"
    );
    const sensorIds = actionNodes.map(actionNode => actionNode.targetSensorId);
    const sensors = await this._sensorModel.Sensor.findBySensorIds(sensorIds);
    const nodeIds = sensors.map(sensor => sensor.nodeId);
    const nodes = await this._nodeModel.Node.findByIds(nodeIds);

    for (let i = 0; i < actionNodes.length; i++) {
      const sensor = sensors.find(
        sensor => sensor._id.toString() === actionNodes[i].targetSensorId
      );
      const node = nodes.find(node => node._id.toString() === sensor.nodeId);

      await this._mqttClient.publish(
        `cmnd/${node.name}/${sensor.name}/${actionNodes[i].targetSensorType}/`,
        actionNodes[i].valueToChangeOn.toString()
      );
    }
  }
}
