import mqttClient from "mqtt";
import {
  ValidationError,
  NotFoundError
} from "../lib/errorHandler/errorHandler";
import moment from "moment";
import cronParser from "cron-parser";









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
