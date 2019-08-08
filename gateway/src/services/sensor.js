async _changeControlType(req, res, next) {
    try {
        const nodeId = req.params.nodeId;
        const sensorId = req.params.sensorId;
        const sensorType = req.params.type;

        const controlType = this._validateControlType(req, next);
        await this._checkifNodeExists(nodeId);
        const sensor = await this._checkIfSensorExists(sensorId);
        this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

        const onlyActionTypes = this._config.nodeTypes
            .filter(node => node.action)
            .map(node => node.name);

        if (!this._isActionType(sensorType)) {
            throw new ValidationError(
                `type should be either of ${onlyActionTypes.join("', '")}`
            );
        }

        const typeIndex = sensor.types.findIndex(
            typeObject => typeObject.type === sensorType
        );
        if (typeIndex === -1) {
            throw new ValidationError(
                `Type ${sensorType} not exists in node with id of ${nodeId}`
            );
        }

        await this._actionNodeModel.ActionNode.find({ targetSensorId: sensorId })
            .remove()
            .exec();

        await sensor.changeControlType(controlType, typeIndex);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

async _getSensorInfo(req, res, next) {
    try {
        const nodeId = req.params.nodeId;
        const sensorId = req.params.sensorId;
        const sensorType = req.params.type;

        const node = await this._checkifNodeExists(nodeId);
        const sensor = await this._checkIfSensorExists(sensorId);
        this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

        const response = {
            sensorId: sensorId,
            nodeId: nodeId,
            nodeName: node.name,
            sensorName: sensor.name,
            sensorType: sensorType,
            controlType: sensor.types.find(
                typeObject => typeObject.type === sensorType
            ).control
        };

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
}
