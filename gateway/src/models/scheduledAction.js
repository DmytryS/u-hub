import mongoose from "mongoose";
const { Schema } = mongoose;

const shceduledActionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  schedule: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    required: true
  }
});

class ScheduledAction {
  /**
   * Finds all scheduled actions
   * @param {Object} filterParams object with parameters for finding scheduled actions
   * @returns {Promise<ScheduledAction>} promise to return found scheduled actions
   */
  static async findScheduledActions(filterParams) {
    let filterObject = {};
    let skipRecords = 0;
    let limitRecords = 10;

    if (filterParams["skip"]) {
      skipRecords = parseInt(filterParams.skip);
    }
    if (filterParams["limit"]) {
      limitRecords = parseInt(filterParams.limit);
    }
    if (filterParams["enabled"]) {
      filterObject.enabled = filterParams["enabled"] === "true";
    }
    if (filterParams["schedule"]) {
      filterObject.schedule = filterParams["schedule"];
    }

    return this.aggregate()
      .match(filterObject)
      .skip(skipRecords)
      .limit(limitRecords);
  }

  /**
   * Saves scheduled actions
   * @param {Object} scheduledActionObject scheduled actions to save
   * @returns {Promise<ScheduledAction>} promise to return scheduledAction added
   */
  static async saveNewScheduledAction(scheduledActionObject) {
    return this(scheduledActionObject).save();
  }

  /**
   * Edits scheduled action
   * @param scheduledActionObject
   * @returns {Promise} returns promise which resolves when scheduled action will be saved
   */
  async updateScheduledAction(scheduledActionObject) {
    this.name = scheduledActionObject.name;
    this.schedule = scheduledActionObject.schedule;
    this.enabled = scheduledActionObject.enabled;
    return this.save();
  }

  /**
   * Finds enabled scheduled actions
   * @returns {Promise<ScheduledAction>} promise to return cursor
   */
  static async enabledScheduledActionsCursor() {
    return this.find({ enabled: true });
  }

}

shceduledActionSchema.loadClass(ScheduledAction);

delete mongoose.connection.models.ScheduledAction;
export default mongoose.model("ScheduledAction", shceduledActionSchema);
