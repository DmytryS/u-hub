import mqttClient from "mqtt";

export default function mqttBrokerService(
  config,
  automaticActionModel,
  valueModel,
  nodeModel,
  actionNodeModel,
  sensorModel
) {
  return new MqttBrokerService(
    config,
    automaticActionModel,
    valueModel,
    nodeModel,
    actionNodeModel,
    sensorModel
  );
}
mqttBrokerService.$inject = [
  "config",
  "automaticActionModel",
  "valueModel",
  "nodeModel",
  "actionNodeModel",
  "sensorModel"
];

export class MqttBrokerService {
  constructor(
    config,
    automaticActionModel,
    valueModel,
    nodeModel,
    actionNodeModel,
    sensorModel
  ) {
    this._config = config;
    this._automaticActionModel = automaticActionModel;
    this._valueModel = valueModel;
    this._nodeModel = nodeModel;
    this._actionNodeModel = actionNodeModel;
    this._sensorModel = sensorModel;
    this._mqttClient = mqttClient.connect(
      `mqtt://127.0.0.1:${this._config.mosca.port}`,
      { clientId: "MqttBrokerService" }
    );
  }

  get mqttBrokerReady() {
    return this._mqttBrokerReady.bind(this);
  }

  get clientConnected() {
    return this._clientConnected.bind(this);
  }

  get clientDisconnected() {
    return this._clientDisconnected.bind(this);
  }

  get messagePublished() {
    return this._messagePublished.bind(this);
  }

  _mqttBrokerReady() {
    log.debug(`Mqtt broker is running`);
  }

  _clientConnected(client) {
    log.debug(`Client connected ${client.id}`);
  }

  _clientDisconnected(client) {
    log.debug(`Client disconnected ${client.id}`);
  }

  async _messagePublished(packet, client) {
    if (
      !this._config.nodeTypes.find(
        node => node.name === packet.topic.split("/")[3]
      ) ||
      packet.topic.split("/")[0] !== "stat"
    ) {
      return;
    }

    const nodeName = packet.topic.split("/")[1];
    const sensorName = packet.topic.split("/")[2];
    const sensorType = packet.topic.split("/")[3];
    const value = parseFloat(String.fromCharCode.apply(null, packet.payload));
    if (isNaN(value)) {
      return;
    }

    const node = await this._createNodeIfNotExists(nodeName, sensorType);
    const sensor = await this._createSensorIfNotExists(
      node._id,
      sensorName,
      sensorType
    );
    await this._valueModel.Value.addNewValue(sensor._id, sensorType, value);

    await this._checkActionCondition(sensor._id, sensorType, value);
  }

  async _createNodeIfNotExists(name) {
    let node = await this._nodeModel.Node.findNodeByName(name);
    if (!node) {
      node = await this._nodeModel.Node.saveNewNode(name);
    }
    return node;
  }

  async _createSensorIfNotExists(nodeId, sensorName, sensorType) {
    let sensor = await this._sensorModel.Sensor.findByNodeIdAndName(
      nodeId,
      sensorName
    );
    if (!sensor) {
      sensor = await this._sensorModel.Sensor.addNewSensor(
        nodeId,
        sensorName,
        sensorType,
        "MANUAL"
      );
    } else {
      if (!sensor.types.find(type => type.type === sensorType)) {
        let controlType;
        if (this._isActionType(sensorType)) {
          controlType = "MANUAL";
        } else {
          controlType = "CAN_NOT_BE_CONTROLLED";
        }
        await sensor.addType(sensorType, controlType);
      }
    }

    return sensor;
  }

  async _checkActionCondition(sensorId, sensorType, lastValue) {
    const actions = await this._automaticActionModel.AutomaticAction.findActionsBySensorIdAndType(
      sensorId,
      sensorType
    );
    if (actions.length) {
      actions.forEach(async action => {
        switch (action.condition) {
          case "<":
            if (lastValue < action.valueToCompare) {
              await this._applyActionToNodes(action);
            }
            break;
          case ">":
            if (lastValue > action.valueToCompare) {
              await this._applyActionToNodes(action);
            }
            break;
          case "<=":
            if (lastValue <= action.valueToCompare) {
              await this._applyActionToNodes(action);
            }
            break;
          case ">=":
            if (lastValue >= action.valueToCompare) {
              await this._applyActionToNodes(action);
            }
            break;
          case "!=":
            if (lastValue !== action.valueToCompare) {
              await this._applyActionToNodes(action);
            }
            break;
          case "==":
            if (lastValue === action.valueToCompare) {
              await this._applyActionToNodes(action);
            }
            break;
        }
      });
    }
  }

  async _applyActionToNodes(actionObject) {
    const actionNodes = await this._actionNodeModel.ActionNode.findActionNodesByEmitterIdAndType(
      actionObject._id,
      "AUTOMATIC"
    );
    const sensorIds = actionNodes.map(actionNode => actionNode.targetSensorId);
    const sensors = await this._sensorModel.Sensor.findBySensorIds(sensorIds);
    const nodeIds = sensors.map(sensor => sensor.nodeId);
    const nodes = await this._nodeModel.Node.findByIds(nodeIds);

    actionNodes.forEach(async actionNode => {
      const sensor = sensors.find(
        sensor => sensor._id.toString() === actionNode.targetSensorId
      );
      const node = nodes.find(node => node._id.toString() === sensor.nodeId);

      await this._mqttClient.publish(
        `cmnd/${node.name}/${sensor.name}/${actionNode.targetSensorType}/`,
        actionNode.valueToChangeOn.toString()
      );
    });
  }

  _isActionType(type) {
    let node = this._config.nodeTypes.find(node => node.name === type);
    return node.action;
  }
}
