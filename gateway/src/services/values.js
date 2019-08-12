
export const getLastDeviceValues = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { sensorId } = req.params;

    const node = await this._checkifNodeExists(nodeId);
    const sensor = await this._checkIfSensorExists(sensorId);

    const values = await this._valueModel.Value.findLastValuesBySensorId(
      sensorId,
    );
    if (!values) {
      throw new NotFoundError(
        `Values for sensor with specified id of ${sensorId} not found`,
      );
    }

    const result = values.map(value => ({
      type: value.doc.type,
      timestamp: moment(value.doc.created_at).format('x'),
      value: value.doc.value,
    }));

    res.status(200).json({ values: result });
  } catch (err) {
    next(err);
  }
};

export const getDetailedValues = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { sensorId } = req.params;
    const sensorType = req.params.type;

    const filterObject = this._validateValueFilterParams(req, next);

    await this._checkifNodeExists(nodeId);
    const sensor = await this._checkIfSensorExists(sensorId);
    this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

    const last = await this._valueModel.Value.findLastValuesBySensorId(
      sensorId,
    );

    const sensorValues = await this._valueModel.Value.findValuesBySensorIdAndType(
      sensorId,
      sensorType,
      filterObject,
    );

    const result = sensorValues.map(sensorValue => ({
      value: sensorValue.value,
      timestamp: sensorValue.created_at,
    }));

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


export const setDeviceValue = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { sensorId } = req.params;
    const { type } = req.params;
    const node = await this._checkifNodeExists(nodeId);
    const sensor = await this._checkIfSensorExists(sensorId);
    const newValue = this._validateValueToSet(req, next);

    const sensorType = sensor.types.find(
      typeObject => typeObject.type === type,
    );
    if (!sensorType) {
      throw new NotFoundError(
        `${type} not found in sensor with id of ${sensorId}`,
      );
    }
    if (sensorType.control !== 'MANUAL') {
      throw new ValidationError(
        `Can not set value to ${type} in sensor with id of ${sensorId}, because control type not 'MANUAL'`,
      );
    }

    await this._mqttClient.publish(
      `cmnd/${node.name}/${sensor.name}/${type}/`,
      newValue.value,
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
