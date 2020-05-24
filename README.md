[![Build Status](https://travis-ci.com/DmytryS/u-hub.svg?branch=master)](https://travis-ci.com/DmytryS/u-hub)

# Start

To start all microservices:
```
docker-compose up
```

Because microservice `apple-homekit` needs host network - it runs without docker. To start `apple-homekit` microservice:

```
cd ./services/apple-homekit
npm i
npm run start:preset 
```

# Development

```
npm run bootstrap
npm run dev
```

# Fake devices

For testing there are two fake devices: outlet and temperature sensor. To run them:
```
cd fake-devices
npm i
npm run start_device_1 # Outlet
npm run start_device_2 # Temperature sensor
```

# Run on Kubernetes :kubernetes:

Every service have deployment files in ./services/%service-name%/provisioning

# Screenshots:

<img src="screenshots/apple-homekit.png?raw=true" width="45%">
<img src="screenshots/automatic-actions.png?raw=true" width="75%">
<img src="screenshots/connect-apple-homekit.png?raw=true" width="75%">
<img src="screenshots/scheduled-actions.png?raw=true" width="75%">