import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default function nodeModel(config) {
  return new NodeModel(config);
}
nodeModel.$inject = ["config"];

export class NodeModel {
  constructor(config) {
    this._config = config;

    const nodeSchema = new Schema({
      name: { type: String, required: true },
      registered: { type: Boolean, required: true }
    });

    nodeSchema.statics.saveNewNode = saveNewNode;
    nodeSchema.statics.findNodeByName = findNodeByName;
    nodeSchema.statics.findNodes = findNodes;
    nodeSchema.statics.findByIds = findByIds;

    /**
     * Saves new node
     * @param {String} name node name
     * @returns {Promise<Node>} promise to return node added
     */
    function saveNewNode(name) {
      return new this({ name: name, registered: false }).save();
    }

    /**
     * Finds node by name
     * @param {String} nodeName name of node
     * @returns {Promise<Node>} promise to return found node
     */
    async function findNodeByName(nodeName) {
      return await this.findOne({ name: nodeName });
    }

    /**
     * Find all nodes
     * @param {Object} filterParams object with parameters for finding nodes
     * @returns {Promise<Node>} promise to return found nodes
     */
    async function findNodes(filterParams) {
      let skipRecords = 0;
      let limitRecords = 10;

      if (filterParams["skip"]) {
        skipRecords = parseInt(filterParams.skip);
      }
      if (filterParams["limit"]) {
        limitRecords = parseInt(filterParams.limit);
      }

      return await this.aggregate()
        .skip(skipRecords)
        .limit(limitRecords)
        .exec();
    }

    /**
     * Finds nodes by array of node ids
     * @param {Array<String>} nodeIds array of node ids
     * @returns {Promise<Node>} promise to return found nodes
     */
    async function findByIds(nodeIds) {
      return await this.find({ _id: { $in: nodeIds } }).exec();
    }

    delete mongoose.connection.models.Node;
    this._Node = mongoose.model("Node", nodeSchema);
  }

  get Node() {
    return this._Node;
  }
}
