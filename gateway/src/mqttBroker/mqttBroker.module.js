'use strict';

import Module from '../lib/module/module';
import mqttBrokerServer from './mqttBroker.server';
import mqttBrokerService from './mqttBroker.service';

export default class MqttBrokerModule extends Module {
  initialize(app) {
    this._app = app;
    this._app.registerService('mqttBrokerServer', mqttBrokerServer);
    this._app.registerService('mqttBrokerService', mqttBrokerService);
  }

  /**
   * Stops the module
   */
  stop() {
    if (this._app) {

    }
  }

  afterServerListen() {
    if (!this._initialized) {
      const mqtt = this._app.container.get('mqttBrokerServer');
      mqtt.startMqttBroker();
      this._initialized = true;
    }
  }
}
