import mongoose from 'mongoose';

const { Schema } = mongoose;

const sensorSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
});

const deviceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sensors: [sensorSchema],
  registered: {
    type: Boolean,
    required: true,
  },
});

// class Device {
//   /**
//    * Saves new node
//    * @param {String} name node name
//    * @returns {Promise<Node>} promise to return node added
//    */
//   static async saveNewNode(name) {
//     return this({ name: name, registered: false }).save();
//   }

//   /**
//    * Finds node by name
//    * @param {String} nodeName name of node`
//    * @returns {Promise<Node>} promise to return found node
//    */
//   static async findNodeByName(nodeName) {
//     return this.findOne({ name: nodeName });
//   }

//   /**
//    * Find all nodes
//    * @param {Object} filterParams object with parameters for finding nodes
//    * @returns {Promise<Node>} promise to return found nodes
//    */
//   static async findNodes(filterParams) {
//     let skipRecords = 0;
//     let limitRecords = 10;

//     if (filterParams["skip"]) {
//       skipRecords = parseInt(filterParams.skip);
//     }
//     if (filterParams["limit"]) {
//       limitRecords = parseInt(filterParams.limit);
//     }

//     return await this.aggregate()
//       .skip(skipRecords)
//       .limit(limitRecords)
//       .exec();
//   }

//   /**
//    * Finds nodes by array of node ids
//    * @param {Array<String>} nodeIds array of node ids
//    * @returns {Promise<Node>} promise to return found nodes
//    */
//   static async findByIds(nodeIds) {
//     return this.find({ _id: { $in: nodeIds } });
//   }

//   /**
//    * Adds new sensor for node
//    * @param {String} nodeId id of node
//    * @param {String} name name of sensor
//    * @param {String} type type of sensor
//    * @param {String} control type of control
//    * @returns {Promise<Sensor>} promise to return added new value
//    */
//   static async addSensor(deviceId, type, control) {
//     return this.sensors.push({ type, control })
//   }

//   /**
//    * Removes type from sensor types list
//    * @param {String} sensorType sensor type to remove
//    * @returns {Promise} promise which will be resolved when sensor edited
//    */
//   async removeSensor(sensorType) {
//     const sensorIndex = this.sensors.filter(type => type.type !== sensorType);

//     this.sensors[sensorIndex].remove();

//     this.save();
//   }

//   /**
//    * Changes control type
//    * @param {String} controlType new control type
//    * @param {Integer} sensorIndex index of sensor
//    * @returns {Promise} promise which will be resolved when sensor edited
//    */
//   async changeSensorControlType(controlType, sensorType) {
//     const sensorIndex = this.sensors.findIndex(sensor => sensor.type === sensorType)
//     this.sensors[sensorIndex].control = controlType;
//     this.save();
//   }


// }

// deviceSchema.loadClass(Device);
delete mongoose.connection.models.Device;

export default mongoose.model('Device', deviceSchema);
