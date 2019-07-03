import mqttClient from "mqtt";
import {
  ValidationError,
  NotFoundError
} from "../lib/errorHandler/errorHandler";
import moment from "moment";
import cronParser from "cron-parser";

export default function nodeService(
  config,
  automaticActionModel,
  scheduledActionModel,
  valueModel,
  nodeModel,
  validation,
  actionNodeModel,
  container,
  sensorModel
) {
  return new NodeService(
    config,
    automaticActionModel,
    scheduledActionModel,
    valueModel,
    nodeModel,
    validation,
    actionNodeModel,
    container,
    sensorModel
  );
}
nodeService.$inject = [
  "config",
  "automaticActionModel",
  "scheduledActionModel",
  "valueModel",
  "nodeModel",
  "validation",
  "actionNodeModel",
  "container",
  "sensorModel"
];

export class NodeService {
  constructor(
    config,
    automaticActionModel,
    scheduledActionModel,
    valueModel,
    nodeModel,
    validation,
    actionNodeModel,
    container,
    sensorModel
  ) {
    this._config = config;

    this._automaticActionModel = automaticActionModel;
    this._scheduledActionModel = scheduledActionModel;
    this._valueModel = valueModel;
    this._nodeModel = nodeModel;
    this._validation = validation;
    this._actionNodeModel = actionNodeModel;
    this._scheduledActionCheckerJob = container.get(
      "scheduledActionCheckerJob"
    );
    this._sensorModel = sensorModel;
    this._mqttClient = mqttClient.connect(
      `mqtt://127.0.0.1:${this._config.mosca.port}`,
      { clientId: "NodeService" }
    );

    this._scheduledActionCheckerJob._initJobs();
  }

  /**
   * Returns endpoint which returns nodes with list of sensors
   * @returns {Function(req, res, next)} endpoint which returns list of nodes
   */
  get getNodes() {
    return this._getNodes.bind(this);
  }

  /**
   * Returns endpoint which sets value to node manually
   * @returns {Function(req, res, next)} endpoint which sets value to node
   */
  get createNodeValue() {
    return this._createNodeValue.bind(this);
  }

  /**
   * Returns endpoint which returns node values
   * @returns {Function(req, res, next)} endpoint which returns node values
   */
  get getLastNodeValues() {
    return this._getLastNodeValues.bind(this);
  }

  /**
   * Returns endpoint which returns values array
   * @returns {Function(req, res, next)} endpoint which returns values array
   */
  get getDetailedValues() {
    return this._getDetailedValues.bind(this);
  }

  /**
   * Returns endpoint which returns automatic actions
   * @returns {Function(req, res, next)} endpoint which returns automatic actions
   */
  get getAutomaticActions() {
    return this._getAutomaticActions.bind(this);
  }

  /**
   * Returns endpoint which creates automatic action
   * @returns {Function(req, res, next)} endpoint which creates automatic action
   */
  get createAutomaticAction() {
    return this._createAutomaticAction.bind(this);
  }

  /**
   * Returns endpoint which edits automatic action
   * @returns {Function(req, res, next)} endpoint which edits automatic action
   */
  get updateAutomaticAction() {
    return this._updateAutomaticAction.bind(this);
  }

  /**
   * Returns endpoint which deletes automatic action
   * @returns {Function(req, res, next)} endpoint which deletes automatic action
   */
  get deleteAutomaticAction() {
    return this._deleteAutomaticAction.bind(this);
  }

  /**
   * Returns endpoint which returns action nodes
   * @returns {Function(req, res, next)} endpoint which returns action nodes
   */
  get getActionNodes() {
    return this._getActionNodes.bind(this);
  }

  /**
   * Returns endpoint which creates action node
   * @returns {Function(req, res, next)} endpoint which creates action node
   */
  get createActionNode() {
    return this._createActionNode.bind(this);
  }

  /**
   * Returns endpoint which edits action node
   * @returns {Function(req, res, next)} endpoint which edits action node
   */
  get updateActionNode() {
    return this._updateActionNode.bind(this);
  }

  /**
   * Returns endpoint which deletes action node
   * @returns {Function(req, res, next)} endpoint which deletes action node
   */
  get deleteActionNode() {
    return this._deleteActionNode.bind(this);
  }

  /**
   * Returns endpoint which changes control type of node
   * @returns {Function(req, res, next)} endpoint which changes control type of node
   */
  get changeControlType() {
    return this._changeControlType.bind(this);
  }

  /**
   * Returns endpoint which returns info about type in sensor
   * @returns {Function(req, res, next)} endpoint which returns info about type in sensor
   */
  get getSensorInfo() {
    return this._getSensorInfo.bind(this);
  }

  /**
   * Returns endpoint which returns scheduled actions
   * @returns {Function(req, res, next)} endpoint which returns scheduled actions
   */
  get getScheduledActions() {
    return this._getScheduledActions.bind(this);
  }

  /**
   * Returns endpoint which creates scheduled action
   * @returns {Function(req, res, next)} endpoint which creates scheduled action
   */
  get createScheduledAction() {
    return this._creteScheduledAction.bind(this);
  }

  /**
   * Returns endpoint which edits scheduled action
   * @returns {Function(req, res, next)} endpoint which edits scheduled action
   */
  get updateScheduledAction() {
    return this._updateScheduledAction.bind(this);
  }

  /**
   * Returns endpoint which deletes scheduled action
   * @returns {Function(req, res, next)} endpoint which deletes scheduled action
   */
  get deleteScheduledAction() {
    return this._deleteScheduledAction.bind(this);
  }

  async _getNodes(req, res, next) {
    try {
      this._validateNodesFilterParams(req);
      const nodes = await this._nodeModel.Node.findNodes(req.query);
      const nodeIds = nodes.map(node => node._id.toString());

      const sensors = await this._sensorModel.Sensor.findByNodeIds(nodeIds);
      let result = [];

      nodes.forEach(node => {
        delete node.__v;
        if (req.query.onlyActionNodes) {
          const onlyActionNodes =
            req.query.onlyActionNodes.toString() === "true";
          const filteredSensors = sensors
            .filter(sensor => sensor.nodeId === node._id.toString())
            .filter(sensor =>
              sensor.types.find(
                type => this._isActionType(type._doc.type) === onlyActionNodes
              )
            );

          if (filteredSensors.length > 0) {
            node.sensors = filteredSensors;
            result.push(node);
          }
        } else {
          node.sensors = sensors.filter(
            sensor => sensor.nodeId === node._id.toString()
          );
          result.push(node);
        }
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async _createNodeValue(req, res, next) {
    try {
      const nodeId = req.params.nodeId;
      const sensorId = req.params.sensorId;
      const type = req.params.type;
      const node = await this._checkifNodeExists(nodeId);
      const sensor = await this._checkIfSensorExists(sensorId);
      const newValue = this._validateValueToSet(req, next);

      const sensorType = sensor.types.find(
        typeObject => typeObject.type === type
      );
      if (!sensorType) {
        throw new NotFoundError(
          `${type} not found in sensor with id of ${sensorId}`
        );
      }
      if (sensorType.control !== "MANUAL") {
        throw new ValidationError(
          `Can not set value to ${type} in sensor with id of ${sensorId}, because control type not 'MANUAL'`
        );
      }

      await this._mqttClient.publish(
        `cmnd/${node.name}/${sensor.name}/${type}/`,
        newValue.value
      );

      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

  async _getLastNodeValues(req, res, next) {
    try {
      const nodeId = req.params.nodeId;
      const sensorId = req.params.sensorId;

      const node = await this._checkifNodeExists(nodeId);
      const sensor = await this._checkIfSensorExists(sensorId);

      let values = await this._valueModel.Value.findLastValuesBySensorId(
        sensorId
      );
      if (!values) {
        throw new NotFoundError(
          `Values for sensor with specified id of ${sensorId} not found`
        );
      }

      let result = values.map(value => ({
        type: value.doc.type,
        timestamp: moment(value.doc.created_at).format("x"),
        value: value.doc.value
      }));

      res.status(200).json({ values: result });
    } catch (err) {
      next(err);
    }
  }

  async _getDetailedValues(req, res, next) {
    try {
      const nodeId = req.params.nodeId;
      const sensorId = req.params.sensorId;
      const sensorType = req.params.type;

      const filterObject = this._validateValueFilterParams(req, next);

      await this._checkifNodeExists(nodeId);
      const sensor = await this._checkIfSensorExists(sensorId);
      this._checkIfSensorTypeExistsInSensor(sensor, sensorType);

      const last = await this._valueModel.Value.findLastValuesBySensorId(
        sensorId
      );

      const sensorValues = await this._valueModel.Value.findValuesBySensorIdAndType(
        sensorId,
        sensorType,
        filterObject
      );

      const result = sensorValues.map(sensorValue => ({
        value: sensorValue.value,
        timestamp: sensorValue.created_at
      }));

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

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

  async _getActionNodes(req, res, next) {
    try {
      const emitterType = req.params.actionId ? "AUTOMATIC" : "SCHEDULED";
      const emitterId = req.params.actionId || req.params.schedulerId;

      if (emitterType === "AUTOMATIC") {
        const nodeId = req.params.nodeId;
        const sensorId = req.params.sensorId;
        const sensorType = req.params.type;

        await this._checkifNodeExists(nodeId);
        const sensor = await this._checkIfSensorExists(sensorId);
        this._checkIfSensorTypeExistsInSensor(sensor, sensorType);
        await this._checkIfAutomaticActionExists(emitterId);
      } else {
        await this._checkIfScheduledActionExists(emitterId);
      }

      const actionNodes = await this._actionNodeModel.ActionNode.findActionNodesByEmitterId(
        emitterId
      );

      const result = actionNodes.map(actionNode => ({
        _id: actionNode._id,
        targetSensorId: actionNode.targetSensorId,
        targetSensorType: actionNode.targetSensorType,
        valueToChangeOn: actionNode.valueToChangeOn
      }));

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async _createActionNode(req, res, next) {
    try {
      const emitterType = req.params.actionId ? "AUTOMATIC" : "SCHEDULED";
      const emitterId = req.params.actionId || req.params.schedulerId;

      if (emitterType === "AUTOMATIC") {
        const nodeId = req.params.nodeId;
        await this._checkIfAutomaticActionExists(emitterId);
        await this._checkifNodeExists(nodeId);
      } else {
        await this._checkIfScheduledActionExists(emitterId);
      }

      const actionNode = this._validateActionNode(req, next);
      let sensor = await this._sensorModel.Sensor.findById(
        actionNode.targetSensorId
      );

      if (
        sensor.types.find(
          typeObject => typeObject.type === actionNode.targetSensorType
        ).control !== emitterType
      ) {
        throw new ValidationError(
          `Can not set value to node with id of ${
            actionNode.nodeId
          }, because control type not ${emitterType}`
        );
      }

      actionNode.emitterId = emitterId;
      actionNode.emitterType = emitterType;
      let addedActionNode = await new this._actionNodeModel.ActionNode(
        actionNode
      ).save();

      res.status(200).json({ _id: addedActionNode._id });
    } catch (err) {
      next(err);
    }
  }

  async _updateActionNode(req, res, next) {
    try {
      const reasonType = req.params.nodeId ? "AUTOMATIC" : "SCHEDULED";
      const reasonId = req.params.nodeId || req.params.schedulerId;
      const actionNodeId = req.params.actionNodeId;

      if (reasonType === "AUTOMATIC") {
        const nodeId = req.params.nodeId;
        const sensorType = req.params.type;
        const sensorId = req.params.sensorId;
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
  }

  async _deleteActionNode(req, res, next) {
    try {
      const reasonType = req.params.actionId ? "AUTOMATIC" : "SCHEDULED";
      const reasonId = req.params.actionId || req.params.schedulerId;

      if (reasonType === "AUTOMATIC") {
        const nodeId = req.params.nodeId;
        await this._checkIfAutomaticActionExists(reasonId);
        await this._checkifNodeExists(nodeId);
      } else {
        await this._checkIfScheduledActionExists(reasonId);
      }
      const actionNodeId = req.params.actionNodeId;
      const actionNode = await this._checkIfActionNodeExists(actionNodeId);
      await actionNode.remove();

      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

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

  async _getScheduledActions(req, res, next) {
    try {
      this._validateSchedulerFilterParams(req);
      let scheduledActions = await this._scheduledActionModel.ScheduledAction.findScheduledActions(
        req.query
      );
      scheduledActions.forEach(scheduledAction => delete scheduledAction.__v);
      res.status(200).json(scheduledActions);
    } catch (err) {
      next(err);
    }
  }

  async _creteScheduledAction(req, res, next) {
    try {
      const scheduledActionObject = this._validateScheduledAction(req, next);
      const scheduledAction = await new this._scheduledActionModel.ScheduledAction(
        scheduledActionObject
      ).save();

      this._scheduledActionCheckerJob.stopJobs();
      this._scheduledActionCheckerJob._initJobs();

      res.status(200).json({ _id: scheduledAction._id });
    } catch (err) {
      next(err);
    }
  }

  async _updateScheduledAction(req, res, next) {
    try {
      const schedulerId = req.params.schedulerId;
      let oldScheduledAction = await this._checkIfScheduledActionExists(
        schedulerId
      );
      let newScheduledActionObject = this._validateScheduledAction(req, next);
      await oldScheduledAction.updateScheduledAction(newScheduledActionObject);

      this._scheduledActionCheckerJob.stopJobs();
      this._scheduledActionCheckerJob._initJobs();

      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

  async _deleteScheduledAction(req, res, next) {
    try {
      const schedulerId = req.params.schedulerId;
      let scheduledAction = await this._checkIfScheduledActionExists(
        schedulerId
      );
      await this._actionNodeModel.ActionNode.find({
        reasonId: schedulerId
      }).remove();
      await scheduledAction.remove();

      this._scheduledActionCheckerJob.stopJobs();
      this._scheduledActionCheckerJob._initJobs();

      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

  async _checkifNodeExists(nodeId) {
    const node = await this._nodeModel.Node.findById(nodeId);
    if (!node) {
      throw new NotFoundError(`Node with specified id of ${nodeId} not found`);
    }
    return node;
  }

  async _checkIfSensorExists(sensorId) {
    const sensor = await this._sensorModel.Sensor.findById(sensorId).exec();
    if (!sensor) {
      throw new NotFoundError(
        `Sensor with specified id of ${sensorId} not found`
      );
    }
    return sensor;
  }

  async _checkIfAutomaticActionExists(automaticActionId) {
    const automaticAction = this._automaticActionModel.AutomaticAction.findById(
      automaticActionId
    ).exec();
    if (!automaticAction) {
      throw new NotFoundError(
        `Automatic action with specified id of ${automaticActionId} not found`
      );
    }
    return automaticAction;
  }

  async _checkIfScheduledActionExists(scheduledActionId) {
    const scheduledAction = this._scheduledActionModel.ScheduledAction.findById(
      scheduledActionId
    ).exec();
    if (!scheduledAction) {
      throw new NotFoundError(
        `Scheduled action with specified id of ${scheduledActionId} not found`
      );
    }
    return scheduledAction;
  }

  async _checkIfActionNodeExists(actionNodeId) {
    const actionNode = this._actionNodeModel.ActionNode.findById(
      actionNodeId
    ).exec();
    if (!actionNode) {
      throw new NotFoundError(
        `ActionNode with specified id of ${actionNodeId} not found`
      );
    }
    return actionNode;
  }

  _checkIfSensorTypeExistsInSensor(sensor, sensorType) {
    if (!sensor.types.find(type => type.type === sensorType)) {
      throw new NotFoundError(
        `Sensor type ${sensorType} not found in sensor with id of ${sensor._id}`
      );
    }
  }

  _validateAction(req, next) {
    function validateConditionParam(value, onError) {
      const conditions = ["<", ">", ">=", "<=", "!=", "=="];
      if (conditions.indexOf(value.condition) === -1) {
        onError(
          "Type must be either of '<', '>', '>=', '<=', '!=', '=='",
          "type",
          null
        );
      }
    }

    const action = req.body;
    const validator = this._validation.validator;

    const userRules = validator
      .isObject()
      .withRequired("valueToCompare", validator.isNumber({ allowString: true }))
      .withCustom(validateConditionParam.bind(this))
      .withRequired("condition", validator.isString())
      .withRequired("enabled", validator.isBoolean());

    if (!this._validation.validate(userRules, action, next)) {
      return;
    }
    return action;
  }

  _validateActionNode(req, next) {
    function validateActionTypeParam(value, onError) {
      const onlyActionTypes = this._config.nodeTypes
        .filter(node => node.action)
        .map(node => node.name);

      if (onlyActionTypes.indexOf(value.targetSensorType) === -1) {
        onError(
          `Node type must be either of '${onlyActionTypes.join("', '")}'`,
          "targetSensorType",
          null
        );
      }
    }
    const actionNode = req.body;
    const validator = this._validation.validator;

    const userRules = validator
      .isObject()
      .withCustom(validateActionTypeParam.bind(this))
      .withRequired(
        "valueToChangeOn",
        validator.isNumber({ allowString: true })
      )
      .withRequired("targetSensorId", validator.isString())
      .withRequired("targetSensorType", validator.isString());

    if (!this._validation.validate(userRules, actionNode, next)) {
      return;
    }
    return actionNode;
  }

  _validateNodesFilterParams(req) {
    const validator = this._validation.validator;

    const filterRules = validator
      .isObject()
      .withOptional("skip", validator.isInteger({ allowString: true, min: 0 }))
      .withOptional("limit", validator.isInteger({ allowString: true, min: 1 }))
      .withOptional(
        "onlyActionNodes",
        validator.isString({ regex: /true|false/ })
      );

    this._validation.validate(filterRules, req.query);
  }

  _validateControlType(req, next) {
    function validateControlTypeParam(value, onError) {
      const controlTypes = ["AUTOMATIC", "SCHEDULED", "MANUAL"];
      if (controlTypes.indexOf(value["control"]) === -1) {
        onError(
          `control type must be either of 'AUTOMATIC', 'SCHEDULED', 'MANUAL'`,
          "control",
          null
        );
      }
    }
    const controlType = req.body;
    const validator = this._validation.validator;

    const userRules = validator
      .isObject()
      .withCustom(validateControlTypeParam.bind(this))
      .withRequired("control", validator.isString());

    if (!this._validation.validate(userRules, controlType, next)) {
      return;
    }
    return controlType.control;
  }

  _validateSchedulerFilterParams(req) {
    function validateEnabledParam(value, onError) {
      if (
        value["enabled"] &&
        value["enabled"] !== "true" &&
        value["enabled"] !== "false"
      ) {
        onError(`enabled must be either of 'true' or 'false'`, "enabled", null);
      }
    }
    const validator = this._validation.validator;

    const filterRules = validator
      .isObject()
      .withOptional("skip", validator.isInteger({ allowString: true, min: 0 }))
      .withOptional("limit", validator.isInteger({ allowString: true, min: 1 }))
      .withCustom(validateEnabledParam.bind(this))
      .withOptional("enabled", validator.isString())
      .withOptional("schedule", validator.isString());

    this._validation.validate(filterRules, req.query);
  }

  _isActionType(type) {
    const node = this._config.nodeTypes.find(node => node.name === type);
    return node.action;
  }

  _validateScheduledAction(req, next) {
    function validateCronString(value, onError) {
      try {
        cronParser.parseExpression(value["schedule"]);
      } catch (err) {
        onError(`not valid cron string`, "schedule", null);
      }
    }
    const scheduledAction = req.body;
    const validator = this._validation.validator;

    const userRules = validator
      .isObject()
      .withRequired("name", validator.isString())
      .withCustom(validateCronString.bind(this))
      .withRequired("schedule", validator.isString())
      .withRequired("enabled", validator.isBoolean());

    if (!this._validation.validate(userRules, scheduledAction, next)) {
      return;
    }
    return scheduledAction;
  }

  _validateValueFilterParams(req, next) {
    function validateStartEndDates(value, onError) {
      if (
        (value.fromDate && !value.toDate) ||
        (!value.fromDate && value.toDate)
      ) {
        onError(
          `Both start and end date bust be defined`,
          "fromDate|toDate",
          null
        );
      } else {
        if (value.fromDate && value.toDate && value.fromDate > value.toDate) {
          onError(
            `End date must be greater than start date`,
            "fromDate|toDate",
            null
          );
        }
      }
    }
    const filterObject = req.query;
    const validator = this._validation.validator;

    const userRules = validator
      .isObject()
      .withCustom(validateStartEndDates.bind(this))
      .withOptional(
        "fromDate",
        validator.isInteger({ allowString: true, min: 0 })
      )
      .withOptional(
        "toDate",
        validator.isNumber({ allowString: true, min: 0 })
      );

    if (!this._validation.validate(userRules, filterObject, next)) {
      return;
    }
    return filterObject;
  }

  _validateValueToSet(req, next) {
    const valueToSet = req.body;
    const validator = this._validation.validator;

    const userRules = validator
      .isObject()
      .withOptional("value", validator.isInteger({ allowString: true }));

    if (!this._validation.validate(userRules, valueToSet, next)) {
      return;
    }
    return valueToSet;
  }
}
