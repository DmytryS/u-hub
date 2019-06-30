'use strict';

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default function actionNodeModel(config) {
  return new ActionNodeModel(config);
}
actionNodeModel.$inject = ['config'];

export class ActionNodeModel {
  constructor(config) {
    this._config = config;
    const onlyActionTypes = this._config.nodeTypes
      .filter(node => node.action)
      .map(node => node.name);

    const actionNodeTypes = {
      values: onlyActionTypes,
      message: `node type must be either of '${onlyActionTypes.join('\', \'')}'`
    };
    const reasonType = {
      values: ['AUTOMATIC', 'SCHEDULED'],
      message: `node type must be either of 'AUTOMATIC' or 'SCHEDULED'`
    };

    const actionNodeSchema = new Schema({
      emitterId: {type: String, required: true},
      emitterType: {type: String, enum: reasonType, required: true},
      targetSensorId: {type: String, required: true},
      targetSensorType: {type: String, enum: actionNodeTypes, required: true},
      valueToChangeOn: {type: Number, required: true}
  });

  actionNodeSchema.statics.createActionNode = createActionNode;
  actionNodeSchema.statics.findActionNodesByEmitterIdAndType = findActionNodesByEmitterIdAndType;
  actionNodeSchema.statics.findActionNodesByEmitterId = findActionNodesByEmitterId;
  actionNodeSchema.statics.addNewActionNode = addNewActionNode;

  /**
   * Creates action node
   * @param {String} emitterId id of emiiter
   * @param {String} emitterType type of emitter
   * @param {String} targetSensorId target sensor id
   * @param {String} targetSensorType target sensor type
   * @param {Number} valueToChangeOn value to change on on sensor
   * @returns {Promise<ActionNode>} promise with action node will be resolved when action node saved;
   */
  function createActionNode(emitterId, emitterType, targetSensorId, targetSensorType, valueToChangeOn) {
    return this({emitterId, emitterType, targetSensorId, targetSensorType, valueToChangeOn}).save();
  }

  /**
   * Finds action nodes by id of scheduled action or automatic action
   * @param {String} emitterId id of scheduled action or automatic action
   * @param {String} emitterType type of action
   * @returns {Promise<ActionNode>} promise to return found actionNodes
   */
  async function findActionNodesByEmitterIdAndType(emitterId, emitterType) {
    return await this.find({emitterId, emitterType}).exec();
  }

  /**
   * Finds action nodes by id of scheduled action or automatic action
   * @param {String} emitterId id of scheduled action or automatic action
   * @returns {Promise<ActionNode>} returns promise which will be resolved when found action nodes
   */
  async function findActionNodesByEmitterId(emitterId) {
    return await this.find({emitterId}).exec();
  }

  /**
   * Creates action node
   * @param {String} actionNodeOnject object with action node
   * @returns {Promise<ActionNode>} promise with ActionNode will be resolve when ActionNode saved
   */
  function addNewActionNode(actionNodeOnject) {
    return this(actionNodeOnject).save();
  }

  delete mongoose.connection.models.ActionNode;
  this._ActionNode = mongoose.model('ActionNode', actionNodeSchema);
}

get ActionNode() {
  return this._ActionNode;
}
}