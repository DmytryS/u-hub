import amqp from 'amqplib';

export const getActions = async (req, res, next) => {
  try {
    const emitterType = req.params.actionId ? 'AUTOMATIC' : 'SCHEDULED';
    const emitterId = req.params.actionId || req.params.schedulerId;

    if (emitterType === 'AUTOMATIC') {
      const { nodeId } = req.params;
      const { sensorId } = req.params;
      const sensorType = req.params.type;

      await this._checkifNodeExists(nodeId);
      const sensor = await this._checkIfSensorExists(sensorId);
      this._checkIfSensorTypeExistsInSensor(sensor, sensorType);
      await this._checkIfAutomaticActionExists(emitterId);
    } else {
      await this._checkIfScheduledActionExists(emitterId);
    }

    const actionNodes = await this._actionNodeModel.ActionNode.findActionNodesByEmitterId(
      emitterId,
    );

    const result = actionNodes.map(actionNode => ({
      _id: actionNode._id,
      targetSensorId: actionNode.targetSensorId,
      targetSensorType: actionNode.targetSensorType,
      valueToChangeOn: actionNode.valueToChangeOn,
    }));

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


export const createAction = async (req, res, next) => {
  try {
    const emitterType = req.params.actionId ? 'AUTOMATIC' : 'SCHEDULED';
    const emitterId = req.params.actionId || req.params.schedulerId;

    if (emitterType === 'AUTOMATIC') {
      const { nodeId } = req.params;
      await this._checkIfAutomaticActionExists(emitterId);
      await this._checkifNodeExists(nodeId);
    } else {
      await this._checkIfScheduledActionExists(emitterId);
    }

    const actionNode = this._validateActionNode(req, next);
    const sensor = await this._sensorModel.Sensor.findById(
      actionNode.targetSensorId,
    );

    if (
      sensor.types.find(
        typeObject => typeObject.type === actionNode.targetSensorType,
      ).control !== emitterType
    ) {
      throw new ValidationError(
        `Can not set value to node with id of ${
          actionNode.nodeId
        }, because control type not ${emitterType}`,
      );
    }

    actionNode.emitterId = emitterId;
    actionNode.emitterType = emitterType;
    const addedActionNode = await new this._actionNodeModel.ActionNode(
      actionNode,
    ).save();

    res.status(200).json({ _id: addedActionNode._id });
  } catch (err) {
    next(err);
  }
};

export const updateAction = async (req, res, next) => {
  try {
    const reasonType = req.params.nodeId ? 'AUTOMATIC' : 'SCHEDULED';
    const reasonId = req.params.nodeId || req.params.schedulerId;
    const { actionNodeId } = req.params;

    if (reasonType === 'AUTOMATIC') {
      const { nodeId } = req.params;
      const sensorType = req.params.type;
      const { sensorId } = req.params;
      await this._checkifNodeExists(nodeId);
      const sensor = await this._checkIfSensorExists(sensorId);
      this._checkIfSensorTypeExistsInSensor(sensor, sensorType);
      this._checkIfAutomaticActionExists(reasonId);
    } else {
      await this._checkIfScheduledActionExists(reasonId);
    }

    const oldActionNode = await this._checkIfActionNodeExists(actionNodeId);

    const newActionNode = this._validateActionNode(req, next);

    oldActionNode.targetSensorId = newActionNode.targetSensorId;
    oldActionNode.targetSensorType = newActionNode.targetSensorType;
    oldActionNode.valueToChangeOn = newActionNode.valueToChangeOn;

    await oldActionNode.save();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const deleteAction = async (req, res, next) => {
  try {
    const reasonType = req.params.actionId ? 'AUTOMATIC' : 'SCHEDULED';
    const reasonId = req.params.actionId || req.params.schedulerId;

    if (reasonType === 'AUTOMATIC') {
      const { nodeId } = req.params;
      await this._checkIfAutomaticActionExists(reasonId);
      await this._checkifNodeExists(nodeId);
    } else {
      await this._checkIfScheduledActionExists(reasonId);
    }
    const { actionNodeId } = req.params;
    const actionNode = await this._checkIfActionNodeExists(actionNodeId);
    await actionNode.remove();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
