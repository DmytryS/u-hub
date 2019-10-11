import 'dotenv/config.js'
import http from 'http'
import express from 'express'
import cors from 'cors'
import ApolloServerExpress from 'apollo-server-express'
import { logger, amqp } from './lib/index.js'
import resolver from './resolver.js'
import typeDefs from './schema.js'
import listener from './listener.js'

const {
  HTTP_PORT,
  HTTP_HOST,
  AMQP_APOLLO_QUEUE
} = process.env
const { ApolloServer } = ApolloServerExpress
const app = express()

app.use(cors())

// const schema = makeExecutableSchema({ resolvers, typeDefs });
const resolvers = {
  // Query: {
  //   device: resolver.device.query,
  //   devices: resolver.device.query,
  //   action: resolver.action.query,
  //   automaticAction: resolver.automaticAction.query,
  //   scheduledAction: resolver.scheduledAction.query,
  //   value: resolver.value.query,
  //   values: resolver.value.query,
  // },
  // Mutation: {
  //   device: resolver.device.mutation,
  //   action: resolver.action.mutation,
  //   automaticAction: resolver.automaticAction.mutation,
  //   scheduledAction: resolver.scheduledAction.mutation,
  //   value: resolver.value.mutation,
  // },
  // Device: {
  //   sensors: resolver.sensor.query,
  // },
  Query: {
    device: resolver,
    devices: resolver,
    // action: resolver,
    automaticAction: resolver,
    automaticActions: resolver,
    scheduledAction: resolver,
    scheduledActions: resolver,
    value: resolver,
    // values: resolver,
  },
  Mutation: {
    device: resolver,
    automaticAction: resolver,
    scheduledAction: resolver,
    value: resolver,
  },
  Device: {
    sensors: resolver,
  },
  AutomaticAction: {
    actions: resolver,
    sensor: resolver,
  },
  ScheduledAction: {
    actions: resolver,
  },
  Action: {
    sensor: resolver,
  },
  Sensor: {
    device: resolver,
  },
  Value: {
    sensor: resolver,
  }
}

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    settings: {
      'editor.reuseHeaders': true,
      'schema.polling.enable': true,
    }
  }
})
apollo.applyMiddleware({ app, path: '/' })

const onReady = () => logger.info(`[HTTP] Gateway listening http://${HTTP_HOST}:${HTTP_PORT}`)

http.createServer(app).listen(HTTP_PORT || 3000, HTTP_HOST || '0.0.0.0', onReady)

amqp.listen(AMQP_APOLLO_QUEUE, listener)
