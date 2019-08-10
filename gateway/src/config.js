module.exports = {
  port: process.env.PORT,
  db: {
    type: 'mongo',
    url: process.env.MONGODB_URI,
  },
  baseUrl: 'api/v1',
  mosca: {
    port: 1883,
    pubsubCollection: 'ascoltatori',
  },
  nodeTypes: [
    {
      name: 'TEMP_SENSOR',
      action: false,
    },
    {
      name: 'HUMIDITY_SENSOR',
      action: false,
    },
    {
      name: 'LIGHT_SENSOR',
      action: false,
    },
    {
      name: 'VOLTAGE_SENSOR',
      action: false,
    },
    {
      name: 'CURRENT_SENSOR',
      action: false,
    },
    {
      name: 'RELAY',
      action: true,
    },
    {
      name: 'RGB_LIGHT',
      action: true,
    },
    {
      name: 'VOLTAGE_REGULATOR',
      action: true,
    },
  ],
};
