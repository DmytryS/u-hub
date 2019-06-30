'use strict';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import moment from 'moment';

export default function sensorModel(config) {
  return new SensorModel(config);
}
sensorModel.$inject = ['config'];

export class SensorModel {
  constructor(config) {
    this._config = config;

    const allTypes = this._config.nodeTypes.map(node => node.name);
    const nodeTypes = {
      values: allTypes,
      message: `node type must be either of '${allTypes.join('\', \'')}'`
    };
    const controlTypes = {
      values: ['AUTOMATIC', 'SCHEDULED', 'MANUAL', 'CAN_NOT_BE_CONTROLLED'],
      message: 'control must be either of \'AUTOMATIC\', \'SCHEDULED\', \'MANUAL\' or \'CAN_NOT_BE_CONTROLLED\''
    };

    const sensorSchema = new Schema({
      name: {type: String, required: true},
      types: [{
        type: {type: String, enum: nodeTypes, required: true},
        control: {type: String, enum: controlTypes, required: true}
      }],
      nodeId: {type: String, required: true},
    },{
      usePushEach: true
    });

    sensorSchema.statics.addNewSensor = addNewSensor;
    sensorSchema.methods.addType = addType;
    sensorSchema.methods.removeType = removeType;
    sensorSchema.methods.changeControlType = changeControlType;
    sensorSchema.statics.findByNodeId = findByNodeId;
    sensorSchema.statics.findBySensorIds = findBySensorIds;
    sensorSchema.statics.findByNodeIdAndName = findByNodeIdAndName;
    sensorSchema.statics.findByNodeIds = findByNodeIds;

    /**
     * Adds new sensor for node
     * @param {String} nodeId id of node
     * @param {String} name name of sensor
     * @param {String} type type of sensor
     * @param {String} control type of control
     * @returns {Promise<Sensor>} promise to return added new value
     */
    function addNewSensor(nodeId, name, type, control) {
      return this({
        name: name,
        types: [{type, control}],
        nodeId: nodeId.toString(),
        date: moment()
      }).save();
    }

    /**
     * Adds new type to sensor types list
     * @param {String} type sensor type to add
     * @param {String} control type of control
     * @returns {Promise<Sensor>} promise which will be resolved when sensor edited
     */
    function addType(type, control) {
      this.types.push({type, control});
      return this.save();
    }

    /**
     * Removes type from sensor types list
     * @param {String} sensorType sensor type to remove
     * @returns {Promise} promise which will be resolved when sensor edited
     */
    function removeType(sensorType) {
      this.types = this.types.filter(type => type.type !== sensorType);
      this.save();
    }

    /**
     * Changes control type
     * @param {String} controlType new control type
     * @param {Integer} sensorIndex index of sensor
     * @returns {Promise} promise which will be resolved when sensor edited
     */
    function changeControlType(controlType, sensorIndex) {
      this.types[sensorIndex].control = controlType;
      this.save();
    }

    /**
     * Finds sensor by node id
     * @param {String} nodeId id of node
     * @returns {Promise<Array<Sensor>>} promise with sensors which will be resolved when sensors found
     */
    async function findByNodeId(nodeId) {
      return await this.find({nodeId}).exec();
    }

    /**
     * Finds sensor by node id and sensor name
     * @param {String} nodeId id of node
     * @param {String} name name of sensor
     * @returns {Promise<Sensor>} promise with sensor which will be resolved when sensor found
     */
    async function findByNodeIdAndName(nodeId, name) {
      return await this.findOne({nodeId, name}).exec();
    }

    /**
     * Finds sensors by sensor ids
     * @param {Array<String>} sensorIds array of sensor ids
     * @returns {Promise<Array<Sensor>>} promise with sensors will be resolve when sensors found
     */
    async function findBySensorIds(sensorIds) {
      return await this.find({_id: {$in: sensorIds}}).exec();
    }

    /**
     * Finds sensors by node ids
     * @param {Array<String>} nodeIds array of node ids
     * @returns {Promise<Array<Sensor>>} promise with sensors will be resolve when sensors found
     */
    async function findByNodeIds(nodeIds) {
      return  await this.find({nodeId: {$in: nodeIds}}).exec();
    }

    delete mongoose.connection.models.Sensor;
    this._SensorModel = mongoose.model('Sensor', sensorSchema);
  }

  get Sensor() {
    return this._SensorModel;
  }
}