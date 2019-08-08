import mongoose from "mongoose";
const { Schema } = mongoose;

const sensorSchema = new Schema({
  type: {
    type: String,
    // enum: nodeTypes,
    required: true
  },
  control: {
    type: String,
    enum: controlTypes,
    required: true
  }
});

const deviceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  sensors: [sensorSchema],
  registered: {
    type: Boolean,
    required: true
  }
});

class Device {

  /**
   * Finds nodes by array of node ids
   * @param {Array<String>} nodeIds array of node ids
   * @returns {Promise<Node>} promise to return found nodes
   */
  static async findByIds(nodeIds) {
    return this.find({ _id: { $in: nodeIds } });
  }

  /**
   * Adds new sensor for node
   * @param {String} nodeId id of node
   * @param {String} name name of sensor
   * @param {String} type type of sensor
   * @param {String} control type of control
   * @returns {Promise<Sensor>} promise to return added new value
   */
  static async addSensor(deviceId, type, control) {
    return this.sensors.push({ type, control })
  }

  /**
   * Removes type from sensor types list
   * @param {String} sensorType sensor type to remove
   * @returns {Promise} promise which will be resolved when sensor edited
   */
  async removeSensor(sensorType) {
    const sensorIndex = this.sensors.filter(type => type.type !== sensorType);

    this.sensors[sensorIndex].remove();

    this.save();
  }

  /**
   * Changes control type
   * @param {String} controlType new control type
   * @param {Integer} sensorIndex index of sensor
   * @returns {Promise} promise which will be resolved when sensor edited
   */
  async changeSensorControlType(controlType, sensorType) {
    const sensorIndex = this.sensors.findIndex(sensor => sensor.type === sensorType)
    this.sensors[sensorIndex].control = controlType;
    this.save();
  }

}

deviceSchema.loadClass(Device);
delete mongoose.connection.models.device;

export default mongoose.model("device", deviceSchema);
