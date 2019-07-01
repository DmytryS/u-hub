import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default function automaticActionModel(config) {
  return new AutomaticActionModel(config);
}
automaticActionModel.$inject = ["config"];

export class AutomaticActionModel {
  constructor(config) {
    this._config = config;

    const conditionList = {
      values: ["<", ">", ">=", "<=", "!=", "=="],
      message: "condition must be either of '<', '>', '>=', '<=', '!=', '=='"
    };

    const allTypes = this._config.nodeTypes.map(node => node.name);
    const nodeTypes = {
      values: allTypes,
      message: `node type must be either of '${allTypes.join("', '")}'`
    };

    const automaticActionSchema = new Schema({
      sensorId: { type: String, required: true },
      sensorType: { type: String, enum: nodeTypes, required: true },
      valueToCompare: { type: Number, required: true },
      condition: { type: String, enum: conditionList, required: true },
      enabled: { type: Boolean, required: true }
    });

    automaticActionSchema.statics.createAutomaticAction = createAutomaticAction;
    automaticActionSchema.statics.findActionsBySensorId = findActionsBySensorId;
    automaticActionSchema.statics.findActionsBySensorIdAndType = findActionsBySensorIdAndType;
    automaticActionSchema.statics.findAutomaticActionsBySensorIds = findAutomaticActionsBySensorIds;

    /**
     *  Creates automatic action
     *  @param {Object} automaticActionObject automatic action object
     *  @returns {Promise<AutomaticAction>} promise with automatic action will be resolved when automatic action created
     */
    function createAutomaticAction(automaticActionObject) {
      return this(automaticActionObject).save();
    }

    /**
     * Finds automatic actions for sensor
     * @param {String} sensorId id of sensor
     * @returns {Promise<AutomaticAction>} promise to return found action nodes
     */
    async function findActionsBySensorId(sensorId) {
      return await this.find({ sensorId }).exec();
    }

    /**
     * Finds automatic actions by array of sensor ids
     * @param sensorIds array of sensor ids
     * @returns {Promise<AutomaticAction>} promise with found automatic actions
     */
    async function findAutomaticActionsBySensorIds(sensorIds) {
      return await this.find({ sensorId: { $in: sensorIds } }).exec();
    }

    /**
     * Finds automatic action for node with type
     * @param {String} sensorId id of sensor
     * @param {String} sensorType type of sensor
     * @returns {Promise<AutomaticAction>} promise to return found action node
     */
    async function findActionsBySensorIdAndType(sensorId, sensorType) {
      return await this.find({ sensorId, sensorType }).exec();
    }

    delete mongoose.connection.models.AutomaticAction;
    this._AutomaticAction = mongoose.model(
      "AutomaticAction",
      automaticActionSchema
    );
  }

  get AutomaticAction() {
    return this._AutomaticAction;
  }
}
