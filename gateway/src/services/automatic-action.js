export const getAutomaticActions = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { sensorId } = req.params;
    const sensorType = req.params.type;
    await this._checkifNodeExists(nodeId);
    const sensor = await this._checkIfSensorExists(sensorId);
    this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

    const actionsForSensor = await this._automaticActionModel.AutomaticAction.findActionsBySensorIdAndType(
      sensorId,
      sensorType,
    );
    const result = [];
    actionsForSensor.map((action) => {
      result.push({
        _id: action._id,
        condition: action.condition,
        valueToCompare: action.valueToCompare,
        enabled: action.enabled,
      });
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createAutomaticAction = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { sensorId } = req.params;
    const sensorType = req.params.type;

    await this._checkifNodeExists(nodeId);
    const sensor = await this._checkIfSensorExists(sensorId);
    this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

    const actionObject = this._validateAction(req, next);
    actionObject.sensorId = sensorId;
    actionObject.sensorType = sensorType;
    const action = await this._automaticActionModel.AutomaticAction.createAutomaticAction(
      actionObject,
    );

    res.status(200).json({ _id: action._id });
  } catch (err) {
    next(err);
  }
};

export const updateAutomaticAction = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { sensorId } = req.params;
    const sensorType = req.params.type;
    const { actionId } = req.params;

    await this._checkifNodeExists(nodeId);
    const sensor = await this._checkIfSensorExists(sensorId);
    this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

    const oldAction = await this._checkIfAutomaticActionExists(actionId);
    const newAction = this._validateAction(req, next);

    oldAction.valueToCompare = newAction.valueToCompare;
    oldAction.enabled = newAction.enabled;
    oldAction.condition = newAction.condition;
    await oldAction.save();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const deleteAutomaticAction = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { sensorId } = req.params;
    const sensorType = req.params.type;
    const { actionId } = req.params;

    await this._checkifNodeExists(nodeId);
    const sensor = await this._checkIfSensorExists(sensorId);
    this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

    const actionToDelete = await this._checkIfAutomaticActionExists(actionId);
    await this._actionNodeModel.ActionNode.find({ reasonId: actionId })
      .remove()
      .exec();
    await actionToDelete.remove();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
