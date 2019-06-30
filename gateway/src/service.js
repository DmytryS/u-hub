'use strict';
import log4js from 'log4js';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import http from "http";
import express from 'express';
import validationSingleton from './lib/validation/validation';
import intravenous from 'intravenous';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as errorHanlderModule from './lib/errorHandler/errorHandler';
import MongoDatabase from './lib/database/database';
import MqttBrokerModule from './mqttBroker/mqttBroker.module';
import automaticActionModel from './nodes/automaticAction.model';
import scheduledActionModel from './nodes/scheduledAction.model';
import nodeModel from './nodes/node.model';
import valueModel from './nodes/value.model';
import sensorModel from './nodes/sensor.model';
import nodeRouter from './nodes/node.router';
import nodeService from './nodes/node.service';
import actionNodeModel from './nodes/actionNode.model'
import scheduledActionCheckerJob from './nodes/scheduledActionChecker.job';
import frontEndRouter from './frontEnd/frontEnd.router';

const conf = process.env.APP_CONFIG ? require('./' + process.env.APP_CONFIG) : require('./config');

export default class Service {
  constructor() {
    this._routers = [];
    this._modules = [];
    this._jobs = [];
    this._extendExpressRouter();
    this._logger = log4js.getLogger('Application');
    this._mqttBrokerModule = new MqttBrokerModule();
  }

  start() {
    const config = conf;
    let logPath = '../' + conf.log4js.path + '/smart-grid-manager.log';
    logPath = path.join(__dirname, logPath);
    this._configureLogs(config, logPath);
    this.registerRouters(config);
    this.connectDb(config);
    this._startServer(config.port || 3030);
    this._registerShutdownHooks();
  }


  registerServices() {
    if (!this.isContainerInitialized()) {
      this.registerService('config', conf);
      this.registerService('validation', this.validation);
      this.registerService('actionNodeModel', actionNodeModel, 'perRequest');
      this.registerService('nodeModel', nodeModel, 'perRequest');
      this.registerService('valueModel', valueModel, 'perRequest');
      this.registerService('sensorModel', sensorModel, 'perRequest');
      this.registerService('automaticActionModel', automaticActionModel, 'perRequest');
      this.registerService('scheduledActionModel', scheduledActionModel, 'perRequest');
      this.registerService('nodeRouter', nodeRouter);
      this.registerService('nodeService', nodeService);
      this.registerService('scheduledActionCheckerJob', scheduledActionCheckerJob);
      this.registerService('frontEndRouter', frontEndRouter);
    }
  }

  connectDb(config) {
    if (config.db) {
      mongoose.Promise = Promise;
      this._database = new MongoDatabase(config);
      return this._database.connect();
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Returns database
   * @returns {MongoDatabase} database
   */
  get database() {
    return this._database;
  }

  /**
   * Returns intravenous container
   * @returns {Container} intravenous container
   */
  get container() {
    this._createContainer();
    return this._container;
  }

  /**
   * Determines if container have been initialized
   * @returns {Boolean} container initialized status
   */
  isContainerInitialized() {
    return this._container && true;
  }

  /**
   * Registers an intravenous service
   * @param {string} id service id
   * @param {Function|Object} service intravenous service
   * @param {string} scope service scope
   */
  registerService(id, service, scope) {
    this.container.register(id, service, scope || 'singleton');
  }

  /**
   * Return errorHandler module. A shorthand for import * as ... from 'express-microservice/.../errorHandler'
   * @returns {--global-type--} errorHandler module
   */
  get errorHandler() {
    return errorHanlderModule;
  }

  /**
   * Returns validation instance
   * @returns (Validation} validation instance
   */
  get validation() {
    return validationSingleton;
  }

  /**
   * Returns HTTP client service
   * @returns {HttpClient} HTTP client service
   */
  get httpClient() {
    return httpClient;
  }

  /**
   * Adds a router
   * @param {string} url url to attach router to
   * @param {Function(container:Container):Router} provider router provide function
   */
  addRouter(url, provider) {
    this._routers.push({
      url: url,
      provider: provider
    });
  }

  /**
   * Add scheduled job
   * @param {string} schedule job schedule
   * @param {Function(container:Container)} provider function which returns the job
   */
  addJob(schedule, provider) {
    this._jobs.push({
      schedule: schedule,
      provider: provider
    });
  }

  /**
   * Register all services and routers
   * @param {Object} config configuration object
   */
  registerRouters(config) {
    this.registerServices();
    this.addModule(this._mqttBrokerModule);
    this.addRouter('/', (container) => container.get('nodeRouter').nodeApi());
    this.addRouter('/', (container) => container.get('frontEndRouter').frontEnd());
    this._createContainer();
    this._initServer(config);
    this._initJobs();
    this._notFoundErrorHandling();
  }

  /**
   * Add a module
   * @param {Module} module module to add
   */
  addModule(module) {
    this._modules.push(module);
    module.initialize(this);
  }

  /**
   * Returns express server
   * @returns {Server} returns express server
   */
  get server() {
    return this._server;
  }

  /**
   * Stops the service
   * @returns {Promise} promise to stop the service
   */
  stop() {
    this._server = null;
    this._routers = [];
    this._modules.forEach((module) => module.stop());
    let prDisconnect = this._database ? this._database.disconnect() : Promise.resolve();
    return prDisconnect
      .then(() => {
        if (this._container) {
          let listener = this._container.get('listener?');
          if (listener) {
            return listener.stop();
          }
        }
        this._container = null;
      })
      .then(() => {
        if (this._connection) {
          return new Promise((resolve, reject) => {
            this._connection.close((err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
      });
  }

  _initServer(config) {
    this._server = express();
    this._httpServer = http.createServer(this._server);
    this._modules.forEach((module) => {
      module.afterServerCreated(this);
    });
    this._middlewareDeclaration(config.baseUrl);
    this._initRoutes();
  }

  _initJobs() {
    let scheduler = this._container.get('scheduler?');
    if (scheduler) {
      this._jobs.forEach((definition) => {
        scheduler.scheduleJob(definition.schedule, definition.provider(this._container));
      });
    }
    this._container.get('scheduledActionCheckerJob');
  }

  _initRoutes() {
    this._routers.forEach((definition) => {
      this._server.use(definition.url, definition.provider(this._container));
    });
  }

  _middlewareDeclaration(baseUrl, apis) {
    apis = apis || [];
    this.server.use((req, res, next) => {
      req.rawBody = new Buffer('');

      req.on('data', chunk => {
        let prev = req.rawBody;
        let length = prev.length + chunk.length;
        req.rawBody = Buffer.concat([prev, chunk], length);
      });

      next();
    });
    this._server.use(bodyParser({limit: '50mb'}));
    this._server.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
    this._server.use(bodyParser.json({limit: '50mb'}));
    this._server.use(bodyParser.text({limit: '50mb'}));
    this._server.use(cors());

    this._server.set('views', path.join(__dirname, '../views'));
    this._server.set('view engine', 'jade');
    this._server.use(express.static(path.join(__dirname, '../public')));

    process.on('uncaughtException', (err) => {
      this._logger.error('Unhandled exception', err);
    });
    process.on('unhandledRejection', (err) => {
      this._logger.error('Unhandled rejection', err);
    });

    this._server.use(express.static(path.join(__dirname, 'public')));
  }

  _notFoundErrorHandling() {
    this._server.use((req, res, next) => {
      next(new errorHanlderModule.NotFoundError('Could not find path ' + req.originalUrl + '. Not found', 404));
    });
    this._server.use(errorHanlderModule.errorHandler);
  }

  _startServer(port) {
    this._connection = this._httpServer.listen(port, () => {
      this._logger.info('Express server listening on port ' + port);
    });
    this._modules.forEach((module) => {
      module.afterServerListen(this._httpServer);
    });
  }

  _createContainer() {
    if (!this._container) {
      this._container = intravenous.create();
    }
  }

  _extendExpressRouter() {
    let originalRouter = require('express').Router;
    if (!require('express').routerAltered) {
      require('express').routerAltered = true;
      require('express').Router = (options) => {
        let router = originalRouter(options);
        router.addSchema = (schema) => {
          this._schemas.push(schema);
          return router;
        };
        router.getSchemas = () => this._schemas;
        return router;
      };
    }
  }

  _registerShutdownHooks() {
    let gracefulShutdown = () => this.stop()
      .then(() => this._logger.info('Service stopped, terminating...'))
      .then(() => process.exit(), () => process.exit());
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  }

  _configureLogs(config, pathToFile) {

    var path1 = path.dirname(pathToFile);

    if (!fs.existsSync(path1)) {
      fs.mkdirSync(path1);
    }
    var appenders = [
      {type: 'file', filename: pathToFile, timezoneOffset: 0}
    ];
    if (process.env.NODE_ENV !== 'production') {
      appenders.push({type: 'console'});
    }
    let levels = ((config.log4js || {}).levels || {});
    for (var category in levels) {
      if (levels.hasOwnProperty(category)) {
        levels[category] = log4js.levels[levels[category]];
      }
    }
    log4js.configure({levels, appenders});
  }
}
