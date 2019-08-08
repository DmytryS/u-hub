import mongoose from "mongoose";
import moment from "moment";

const { Schema } = mongoose;
const { ObjectId } = Schema;

// const allTypes = this._config.nodeTypes.map(node => node.name);
// const nodeTypes = {
//   values: allTypes,
//   message: `node type must be either of '${allTypes.join("', '")}'`
// };

const valueSchema = new Schema(
  {
    sensor: {
      type: ObjectId,
      ref: 'Sensor',
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      // enum: nodeTypes,
      requiered: true
    }
  },
  {
    timestamps: { createdAt: "created_at" }
  }
);

export class Value {
  /**
   * Finds last values for sensor
   * @param {String} sensorId id of sensor
   * @returns {Promise<Value>} promise with found last values
   */
  static async findLastValuesBySensorId(sensorId) {
    return await this.aggregate()
      .match({ sensorId })
      .sort({ created_at: "desc" })
      .group({
        _id: { sensorId: "$sensorId", type: "$type" },
        doc: { $first: "$$ROOT" }
      });
  }

  /**
   * Finds values for sensor
   * @param {String} sensorId sensor id
   * @param {String} type type of sensor
   * @param {Object} filterObject filter object
   * @returns {Promise<Value>} promise with found values
   */
  static async findValuesBySensorIdAndType(sensorId, type, filterObject) {
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

    return this.find({
      sensorId: sensorId,
      type: type,
      created_at: { $gte: fromDate, $lt: toDate }
    });
  }

  /**
   * Adds new value
   * @param {String} sensorId id of sensor
   * @param {String} type sensor type
   * @param {Number} value sensor value
   * @returns {Promise<Value>} promise with added value will be resolved when value saved
   */
  static async addNewValue(sensorId, type, value) {
    return new this({
      sensorId: sensorId,
      type: type,
      value: value
    }).save();
  }
}

valueSchema.loadClass(Value);

delete mongoose.connection.models.Value;
export default mongoose.model("Value", valueSchema);
