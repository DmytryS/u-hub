import mqttClient from "mqtt";
import scheduler from "../lib/scheduler/scheduler";



async _initJobs() {
    const scheduledActions = await this._scheduledActionModel.ScheduledAction.enabledScheduledActionsCursor();
    scheduledActions.forEach(action => {
        this._scheduler.scheduleJob(
            action.schedule,
            this._applyScheduledAction.bind(this, action)
        );
    });
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
