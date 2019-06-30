'use strict';

import validator from 'node-validator';
import {ValidationError} from '../errorHandler/errorHandler';

/**
 * Provides means to validate DTOs and models
 */
export class Validation {

  /**
   * node-validator module
   * @returns {Function} validator module
   */
  get validator() {
    return validator;
  }

  /**
   * Validates a model or a value
   * @param {Object} rules validation rules
   * @param {Object} value value to validate
   * @param {Function(err:Error)} next error callback
   * @returns {Boolean} Returns false if validation failed, true otherwise
   */
  validate(rules, value, next) {
    var valid;
    validator.run(rules, value, function (errorCount, err) {
      valid = errorCount === 0;
      if (!valid) {
        const resultErr = new ValidationError('Validation failed', err);
        if (next) {
          return next(resultErr);
        }
        throw resultErr;
      }
    });
    return valid;
  }

  /**
   * Email validator
   * @param {{message: String}} options options containing custom error message
   * @returns {validate: Function(value:String, onError:Function)} Email validator
   */
  isEmail(options) {
    return {
      validate: validate
    };

    function validate(value, onError) {
      if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
        return onError((options || {}).message || 'Please specify a valid email address');
      }
      return null;
    }
  }

  /**
   * Password strenght validator
   * @param {{minlength: integer, message: String}} options options containing minimal password length
   * and custom error message
   * @returns {validate: Function(value:String, onError:Function)} Password strenght validator
   */
  isStrongPassword(options) {
    return {
      validate: validate
    };

    function validate(value, onError) {
      if (options && options.minlength !== undefined && value.length < options.minlength) {
        return onError((options || {}).message || 'Password cannot be less then ' + options.minlength + ' symbols');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) {
        return onError((options || {}).message ||
          'Password must have lowercase letters, uppercase letters and numbers');
      }
      return null;
    }
  }

  /**
   * Boolean validator
   * @param {{message: String}} options options containing custom error message
   * @returns {validate: Function(value:String, onError:Function)} Boolean validator
   */
  isBoolean(options) {
    return {
      validate: validate
    };

    function validate(value, onError) {
      if (typeof value !== 'boolean') {
        return onError((options || {}).message || 'Value must be of boolean type');
      }
    }
  }
}

let validation = new Validation();
/**
 * Validation instance
 */
export default validation;
