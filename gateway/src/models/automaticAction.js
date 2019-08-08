import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema;

const conditionList = {
  values: ["<", ">", ">=", "<=", "!=", "=="],
  message: "condition must be either of '<', '>', '>=', '<=', '!=', '=='"
};

// const allTypes = this._config.nodeTypes.map(node => node.name);
// const nodeTypes = {
//   values: allTypes,
//   message: `node type must be either of '${allTypes.join("', '")}'`
// };

const automaticActionSchema = new Schema({
  sensor: {
    type: ObjectId,
    ref: 'Sensor',
    required: true
  },
  valueToCompare: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: conditionList,
    required: true
  },
  enabled: {
    type: Boolean, required: true
  }
});


class AutomaticAction {
  /**
   *  Creates automatic action
   *  @param {Object} automaticActionObject automatic action object
   *  @returns {Promise<AutomaticAction>} promise with automatic action will be resolved when automatic action created
   */
  static async createAutomaticAction(automaticActionObject) {
    return this(automaticActionObject).save();
  }

  /**
   * Finds automatic actions for sensor
   * @param {String} sensorId id of sensor
   * @returns {Promise<AutomaticAction>} promise to return found action nodes
   */
  static async findActionsBySensorId(sensorId) {
    return this.find({ sensorId });
  }

  /**
   * Finds automatic actions by array of sensor ids
   * @param sensorIds array of sensor ids
   * @returns {Promise<AutomaticAction>} promise with found automatic actions
   */
  static async findAutomaticActionsBySensorIds(sensorIds) {
    return this.find({ sensorId: { $in: sensorIds } });
  }

  /**
   * Finds automatic action for node with type
   * @param {String} sensorId id of sensor
   * @param {String} sensorType type of sensor
   * @returns {Promise<AutomaticAction>} promise to return found action node
   */
  static async findActionsBySensorIdAndType(sensorId, sensorType) {
    return this.find({ sensorId, sensorType });
  }
}

automaticActionSchema.loadClass(AutomaticAction);

delete mongoose.connection.models.AutomaticAction;
export default mongoose.model("AutomaticAction", automaticActionSchema)
