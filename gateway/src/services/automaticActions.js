async _getAutomaticActions(req, res, next) {
    try {
        const nodeId = req.params.nodeId;
        const sensorId = req.params.sensorId;
        const sensorType = req.params.type;
        await this._checkifNodeExists(nodeId);
        const sensor = await this._checkIfSensorExists(sensorId);
        this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

        let actionsForSensor = await this._automaticActionModel.AutomaticAction.findActionsBySensorIdAndType(
            sensorId,
            sensorType
        );
        let result = [];
        actionsForSensor.map(action => {
            result.push({
                _id: action._id,
                condition: action.condition,
                valueToCompare: action.valueToCompare,
                enabled: action.enabled
            });
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async _createAutomaticAction(req, res, next) {
    try {
        const nodeId = req.params.nodeId;
        const sensorId = req.params.sensorId;
        const sensorType = req.params.type;

        await this._checkifNodeExists(nodeId);
        const sensor = await this._checkIfSensorExists(sensorId);
        this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

        let actionObject = this._validateAction(req, next);
        actionObject.sensorId = sensorId;
        actionObject.sensorType = sensorType;
        const action = await this._automaticActionModel.AutomaticAction.createAutomaticAction(
            actionObject
        );

        res.status(200).json({ _id: action._id });
    } catch (err) {
        next(err);
    }
}

async _updateAutomaticAction(req, res, next) {
    try {
        const nodeId = req.params.nodeId;
        const sensorId = req.params.sensorId;
        const sensorType = req.params.type;
        const actionId = req.params.actionId;

        await this._checkifNodeExists(nodeId);
        const sensor = await this._checkIfSensorExists(sensorId);
        this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

        let oldAction = await this._checkIfAutomaticActionExists(actionId);
        const newAction = this._validateAction(req, next);

        oldAction.valueToCompare = newAction.valueToCompare;
        oldAction.enabled = newAction.enabled;
        oldAction.condition = newAction.condition;
        await oldAction.save();

        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

async _deleteAutomaticAction(req, res, next) {
    try {
        const nodeId = req.params.nodeId;
        const sensorId = req.params.sensorId;
        const sensorType = req.params.type;
        const actionId = req.params.actionId;

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
}
