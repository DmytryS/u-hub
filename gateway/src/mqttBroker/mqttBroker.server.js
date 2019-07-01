import mosca from "mosca";

export default function mqttBrokerServer(config, mqttBrokerService) {
  return new MqttBrokerServer(config, mqttBrokerService);
}
mqttBrokerServer.$inject = ["config", "mqttBrokerService"];

export class MqttBrokerServer {
  constructor(config, mqttBrokerService) {
    this._config = config;
    this._mqttBrokerService = mqttBrokerService;
  }

  startMqttBroker() {
    const ascoltatore = {
      type: this._config.db.type,
      url: this._config.db.url,
      pubsubCollection: this._config.mosca.pubsubCollection,
      mongo: {}
    };
    const moscaSettings = {
      port: this._config.mosca.port,
      backend: ascoltatore,
      persistence: {
        factory: mosca.persistence.Mongo,
        url: this._config.db.url
      }
    };

    this._mqttBroker = new mosca.Server(moscaSettings);
    this._mqttBroker.authorizePublish = this._authPub.bind(this);
    this._mqttBroker.authorizeSubscribe = this._authSub.bind(this);

    this._mqttBroker.on("ready", this._mqttBrokerService.mqttBrokerReady);
    this._mqttBroker.on("published", this._mqttBrokerService.messagePublished);
    this._mqttBroker.on(
      "clientConnected",
      this._mqttBrokerService.clientConnected
    );
    this._mqttBroker.on(
      "clientDisconnected",
      this._mqttBrokerService.clientDisconnected
    );
  }

  _authPub(client, topic, payload, callback) {
    const ok =
      (this._config.nodeTypes.find(node => node.name === topic.split("/")[3]) &&
        topic.split("/")[0] === "stat" &&
        topic.split("/").length === 5) ||
      client.id === "NodeService" ||
      client.id === "MqttBrokerService" ||
      client.id === "ScheduledActionCheckerJob";

    if (ok) {
      callback(null, payload);
    } else {
      callback(null, false);
    }
  }

  _authSub(client, topic, cb) {
    const ok =
      this._config.nodeTypes.findIndex(
        node => node.name === topic.split("/")[3]
      ) !== -1 &&
      topic.split("/")[0] === "cmnd" &&
      topic.split("/").length === 5;

    cb(null, ok);
  }
}
