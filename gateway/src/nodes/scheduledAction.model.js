'use strict';

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default function scheduledActionModel() {
  return new ScheduledActionModel();
}
scheduledActionModel.$inject = [];

export class ScheduledActionModel {
  constructor() {
    const shceduledActionSchema = new Schema({
      name: {type: String, required: true},
      schedule: {type: String, required: true},
      enabled: {type: Boolean, required: true}
    });

    shceduledActionSchema.statics.findScheduledActions = findScheduledActions;
    shceduledActionSchema.statics.saveNewScheduledAction = saveNewScheduledAction;
    shceduledActionSchema.statics.enabledScheduledActionsCursor = enabledScheduledActionsCursor;
    shceduledActionSchema.methods.updateScheduledAction = updateScheduledAction;

    /**
     * Finds all scheduled actions
     * @param {Object} filterParams object with parameters for finding scheduled actions
     * @returns {Promise<ScheduledAction>} promise to return found scheduled actions
     */
    async function findScheduledActions(filterParams) {
      let filterObject = {};
      let skipRecords = 0;
      let limitRecords = 10;

      if (filterParams['skip']) {
        skipRecords = parseInt(filterParams.skip);
      }
      if (filterParams['limit']) {
        limitRecords = parseInt(filterParams.limit);
      }
      if (filterParams['enabled']) {
        filterObject.enabled = (filterParams['enabled'] === 'true');
      }
      if (filterParams['schedule']) {
        filterObject.schedule = filterParams['schedule'];
      }

      return await this
        .aggregate()
        .match(filterObject)
        .skip(skipRecords)
        .limit(limitRecords)
        .exec();
    }

    /**
     * Saves scheduled actions
     * @param {Object} scheduledActionObject scheduled actions to save
     * @returns {Promise<ScheduledAction>} promise to return scheduledAction added
     */
    function saveNewScheduledAction(scheduledActionObject) {
      return new this(scheduledActionObject).save();
    }

    /**
     * Edits scheduled action
     * @param scheduledActionObject
     * @returns {Promise} returns promise which resolves when scheduled action will be saved
     */
    function updateScheduledAction(scheduledActionObject) {
      this.name = scheduledActionObject.name;
      this.schedule = scheduledActionObject.schedule;
      this.enabled = scheduledActionObject.enabled;
      return this.save();
    }

    /**
     * Finds enabled scheduled actions
     * @returns {Promise<ScheduledAction>} promise to return cursor
     */
    function enabledScheduledActionsCursor() {
      return this.find({enabled: true}).exec();
    }

    delete mongoose.connection.models.ScheduledAction;
    this._ShceduledAction = mongoose.model('ScheduledAction', shceduledActionSchema);
  }

  get ScheduledAction() {
    return this._ShceduledAction;
  }
}