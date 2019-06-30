'use strict';

import mongoose from 'mongoose';
import log4js from 'log4js';
import async from 'async';

/**
 * Mongodb database class.
 */
export default class MongoDatabase {

  /**
   * Initializes mongoose database.
   * @param {Object} config DB configuration
   */
  constructor(config) {
    this._logger = log4js.getLogger('database');
    this._config = config;
  }

  /**
   * Connects to the database
   * @return {Promise} promise to connect to database
   */
  connect() {
    return new Promise((resolve, reject) => {
      let testDb = process.env.NODE_ENV === 'test';
      mongoose.connect(
        testDb ? this._config.db.testUrl : this._config.db.url,
        {server: {auto_reconnect: true}},
        onDbConnected.bind(this)
      );

      function onDbConnected(err) {
        if (err) {
          this._logger.error(err);
          reject(err);
        } else {
          this._logger.debug('Connected to the ' + (testDb ? 'test' : 'production') + ' database');
          resolve();
        }
      }
    });
  }

  /**
   * Clears the database
   * @returns {Promise} promise to clear database
   */
  clearDb() {
    return new Promise((resolve, reject) => {
      let count = {};
      async.eachOfSeries(mongoose.connection.collections, (value, key, callback) => {
        count[value.name] = 0;
        function cb(err) {
          count[value.name] = count[value.name] + 1;
          if (err && err.message !== 'ns not found') {
            if (count[value.name] < 10) {
              mongoose.connection.collections[value.name].drop(cb);
            } else {
              callback(err);
            }
          } else {
            callback();
          }
        }
        mongoose.connection.collections[value.name].drop(cb);
      }, err => {
        if (err) {
          this._logger.error('Error cleaning up database', err);
          reject(err);
        } else {
          this._logger.info('Cleaned up database');
          resolve();
        }
      });
    });
  }

  /**
   * Disconnects from database
   * @returns {Promise} promise to diconnect from DB
   */
  disconnect() {
    return new Promise((resolve, reject) => {
      mongoose.connection.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

}
