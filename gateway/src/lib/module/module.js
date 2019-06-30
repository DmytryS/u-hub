'use strict';

/**
 * Module base class
 */
export default class Module {

  /**
   * Initializes the module
   * @param {Application} app application instance
   */
  initialize(app) {}

  /**
   * Stops the module
   */
  stop() {}

  /**
   * Invokes after http.createServer()
   */
  afterServerCreated() {}

  /**
   * Invokes after server.listen()
   * @param {HttpServer} httpServer http server
   */
  afterServerListen(httpServer) {}
}
