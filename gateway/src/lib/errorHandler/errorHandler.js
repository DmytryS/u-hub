import * as log from "loglevel";
let id = 1;

/**
 * Middleware function that handles exceptions
 * It parses the exception pushed via appropriate classes and handles to a user.
 * @param {Object} err error message
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next next function
 */
export function errorHandler(err, req, res, next) {
  log.error("Request error #[" + id + "]", err);
  res.status(err.status || 500);

  res.send(_composeErrorObject(err));
  if (id < 0) {
    id = 1;
  }
}

/**
 * Middleware function that handles websocket exceptions
 * It parses the exception pushed via appropriate classes and handles to a user.
 * @param {Socket} socket socket.io socket object
 * @param {String} requestId id of request
 * @param {Object} error error
 * @returns {Promise} promise
 */
export function websocketsErrorHandler(socket, requestId, error) {
  log.error("Request error #[" + id + "]", error);
  socket.emit("processingError", _composeErrorObject(error, requestId));
  if (id < 0) {
    id = 1;
  }

  return Promise.resolve();
}

function _composeErrorObject(err, requestId) {
  const response = {
    id: id++,
    error: err.name,
    message: err.message
  };
  if (err.code) {
    response.code = err.code;
  }
  if (err.arguments) {
    response.arguments = err.arguments;
  }
  if (err.details) {
    response.details = err.details;
  }
  if (requestId) {
    response.requestId = requestId;
  }

  return response;
}

/**
 * Base class for API errors. Contains indication of HTTP status.
 */
export class ApiError extends Error {
  /**
   * ApiError constructor
   * @param {Function} clazz error name
   * @param {Object} message error message
   * @param {number} status HTTP status
   */
  constructor(clazz, message, status) {
    super(message);
    /**
     * Error name
     * @type {string}
     */
    this.name = clazz.name;
    /**
     * HTTP status code
     * @type {number}
     */
    this.status = status;
    Error.captureStackTrace(this, clazz);
  }

  /**
   * Sets error code, used for i18n
   * @param {string} code error code for i18n
   */
  set code(code) {
    this._code = code;
  }

  /**
   * Returns error code used for i18n
   * @return {string} error code
   */
  get code() {
    return this._code;
  }

  /**
   * Set message arguments for i18n
   * @param {Array<Object>} arguments arguments for i18n
   */
  set arguments(args) {
    this._args = args;
  }

  /**
   * Returns message arguments for i18n
   * @return {Array<Object>} message arguments for i18n
   */
  get arguments() {
    return this._args;
  }
}

/**
 * Represents DatabaseError. This error is to be thrown on database error.
 */
export class DatabaseError extends ApiError {
  /**
   * Constructs database error
   * @param {Object} details error details
   */
  constructor(details) {
    super(DatabaseError, "Database error", 500);
    /**
     * Database error details
     * @type {Object}
     */
    this.details = details;
  }
}

/**
 * Throwing this error results in 404 (Not Found) HTTP response code.
 */
export class NotFoundError extends ApiError {
  /**
   * Represents NotFoundError.
   * @param {string} message error message
   */
  constructor(message) {
    super(NotFoundError, message, 404);
  }
}

/**
 * Throwing this error results in 403 (Forbidden) HTTP response code.
 */
export class ForbiddenError extends ApiError {
  /**
   * Constructs forbidden error.
   * @param {string} message error message
   */
  constructor(message) {
    super(ForbiddenError, message, 403);
  }
}

/**
 * Throwing this error results in 401 (Unautorized) HTTP response code.
 */
export class UnauthorizedError extends ApiError {
  /**
   * Constructs unauthorized error.
   * @param {string} message error message
   */
  constructor(message) {
    super(UnauthorizedError, message, 401);
  }
}

/**
 * Represents validation error. Throwing this error results in 400 (Bad Request) HTTP response code.
 */
export class ValidationError extends ApiError {
  /**
   * Constructs validation error.
   * @param {string} message error message
   * @param {Object} details error data
   */
  constructor(message, details) {
    super(ValidationError, message, 400);
    /**
     * Validation error details
     * @type {Object}
     */
    this.details = details;
  }
}

/**
 * Represents unexpected error. Throwing this error results in 500 (Internal Error) HTTP response code.
 */
export class InternalError extends ApiError {
  /**
   * Constructs unexpected error.
   * @param {string} message error message
   */
  constructor(message) {
    super(InternalError, message, 500);
  }
}

/**
 * Represents conflict error. Throwing this error results in 409 (Conflict) HTTP response code.
 */
export class ConflictError extends ApiError {
  /**
   * Constructs conflict error.
   * @param {string} message error message
   */
  constructor(message) {
    super(ConflictError, message, 409);
  }
}
