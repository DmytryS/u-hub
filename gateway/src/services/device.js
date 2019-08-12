export const getDevices = async (req, res, next) => {
  try {
    this._validateNodesFilterParams(req);
    const nodes = await this._nodeModel.Node.findNodes(req.query);
    const nodeIds = nodes.map(node => node._id.toString());

    const sensors = await this._sensorModel.Sensor.findByNodeIds(nodeIds);
    const result = [];

    nodes.forEach((node) => {
      delete node.__v;
      if (req.query.onlyActionNodes) {
        const onlyActionNodes = req.query.onlyActionNodes.toString() === 'true';
        const filteredSensors = sensors
          .filter(sensor => sensor.nodeId === node._id.toString())
          .filter(sensor => sensor.types.find(
            type => this._isActionType(type._doc.type) === onlyActionNodes,
          ));

        if (filteredSensors.length > 0) {
          node.sensors = filteredSensors;
          result.push(node);
        }
      } else {
        node.sensors = sensors.filter(
          sensor => sensor.nodeId === node._id.toString(),
        );
        result.push(node);
      }
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
