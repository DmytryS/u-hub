import 'dotenv/config.js'
import http from 'http'
import express from 'express'
import cors from 'cors'
import apolloServerExpress from 'apollo-server-express'
import { logger } from './lib/index.js'
// import * as resolver from './resolvers/index.js'
import resolver from './resolver.js'
import typeDefs from './schema.js'

const { HTTP_PORT, HTTP_HOST } = process.env
const { ApolloServer } = apolloServerExpress
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
  }
}

const apolloSchema = new ApolloServer({
  typeDefs,
  resolvers,
})
apolloSchema.applyMiddleware({ app, path: '/playground' })

const apolloApi = new ApolloServer({
  typeDefs,
  playground: {
    settings: {
      'editor.reuseHeaders': true,
      'schema.polling.enable': true,
    }
  }
})
apolloApi.applyMiddleware({ app, path: '/schema' })

const onReady = () => logger.info(`[HTTP] Gateway listening http://${HTTP_HOST}:${HTTP_PORT}`)

http.createServer(app).listen(HTTP_PORT || 3000, HTTP_HOST || '0.0.0.0', onReady)