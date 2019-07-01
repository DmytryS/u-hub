import mongoose from "mongoose";
const Schema = mongoose.Schema;
import moment from "moment";

export default function valueModel(config) {
  return new ValueModel(config);
}
valueModel.$inject = ["config"];

export class ValueModel {
  constructor(config) {
    this._config = config;

    const allTypes = this._config.nodeTypes.map(node => node.name);
    const nodeTypes = {
      values: allTypes,
      message: `node type must be either of '${allTypes.join("', '")}'`
    };

    const valueSchema = new Schema(
      {
        sensorId: { type: String, required: true },
        value: { type: Number, required: true },
        type: { type: String, enum: nodeTypes, requiered: true }
      },
      {
        timestamps: { createdAt: "created_at" }
      }
    );

    valueSchema.statics.findLastValuesBySensorId = findLastValuesBySensorId;
    valueSchema.statics.findValuesBySensorIdAndType = findValuesBySensorIdAndType;
    valueSchema.statics.addNewValue = addNewValue;

    /**
     * Finds last values for sensor
     * @param {String} sensorId id of sensor
     * @returns {Promise<Value>} promise with found last values
     */
    async function findLastValuesBySensorId(sensorId) {
      return await this.aggregate()
        .match({ sensorId })
        .sort({ created_at: "desc" })
        .group({
          _id: { sensorId: "$sensorId", type: "$type" },
          doc: { $first: "$$ROOT" }
        })
        .exec();
    }

    /**
     * Finds values for sensor
     * @param {String} sensorId sensor id
     * @param {String} type type of sensor
     * @param {Object} filterObject filter object
     * @returns {Promise<Value>} promise with found values
     */
    async function findValuesBySensorIdAndType(sensorId, type, filterObject) {
      let fromDate = moment()
        .subtract(6, "hours")
        .toDate();
      let toDate = moment().toDate();

      if (filterObject.fromDate) {
        fromDate = moment(parseInt(filterObject.fromDate)).toDate();
      }
      if (filterObject.toDate) {
        toDate = moment(parseInt(filterObject.toDate)).toDate();
      }

      return await this.find({
        sensorId: sensorId,
        type: type,
        created_at: { $gte: fromDate, $lt: toDate }
      }).exec();
    }

    /**
     * Adds new value
     * @param {String} sensorId id of sensor
     * @param {String} type sensor type
     * @param {Number} value sensor value
     * @returns {Promise<Value>} promise with added value will be resolved when value saved
     */
    function addNewValue(sensorId, type, value) {
      return new this({
        sensorId: sensorId,
        type: type,
        value: value
      }).save();
    }

    delete mongoose.connection.models.Value;
    this._Value = mongoose.model("Value", valueSchema);
  }

  get Value() {
    return this._Value;
  }
}
