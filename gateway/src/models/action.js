import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema;

// const onlyActionTypes = this._config.nodeTypes
//   .filter(node => node.action)
//   .map(node => node.name);
// const actionNodeTypes = {
//   values: onlyActionTypes,
//   message: `node type must be either of '${onlyActionTypes.join("', '")}'`
// };

const emitterType = {
  values: ["AutomaticAction", "ScheduledAction"],
  message: `node type must be either of 'AutomaticAction' or 'ScheduledAction'`
};

const actionSchema = new Schema({
  emitter: {
    type: ObjectId,
    refPath: 'emitterType',
    required: true
  },
  emitterType: {
    type: String,
    enum: emitterType,
    required: true
  },
  target: {
    type: ObjectId,
    ref: 'Device.sensor',
    required: true
  },
  valueToChangeOn: {
    type: String,
    required: true
  }
});

class Action {
  /**
   * Finds action nodes by id of scheduled action or automatic action
   * @param {String} emitterId id of scheduled action or automatic action
   * @param {String} emitterType type of action
   * @returns {Promise<ActionNode>} promise to return found actionNodes
   */
  static async findActionByEmitterIdAndType(emitterId, emitterType) {
    return this.find({ emitter, emitterType });
  }

  /**
   * Finds action nodes by id of scheduled action or automatic action
   * @param {String} emitterId id of scheduled action or automatic action
   * @returns {Promise<ActionNode>} returns promise which will be resolved when found action nodes
   */
  static async findActionByEmitterId(emitterId) {
    return this.find({ emitterId });
  }
}

actionSchema.loadClass(Action);

delete mongoose.connection.models.Action;
export default mongoose.model("Action", actionSchema);
