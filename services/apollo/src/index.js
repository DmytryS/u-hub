import 'dotenv/config.js'
import http from 'http'
import express from 'express'
import cors from 'cors'
import ApolloServerExpress from 'apollo-server-express'
import { logger, amqp, pubsub } from './lib/index.js'
import resolver from './resolver.js'
import subscriber from './subscriber.js'
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

const resolvers = {
  Subscription: {
    sensor: subscriber('sensor'),
    automaticAction: subscriber('automaticAction'),
    scheduledAction: subscriber('scheduledAction'),
    action: subscriber('action'),
    value: subscriber('value'),
  },
  Query: {
    // device: resolver,
    // devices: resolver,
    // action: resolver,
    sensor: resolver,
    sensors: resolver,
    automaticAction: resolver,
    automaticActions: resolver,
    scheduledAction: resolver,
    scheduledActions: resolver,
    value: resolver,
    values: resolver,
  },
  Mutation: {
    // device: resolver,
    sensor: resolver,
    automaticAction: resolver,
    scheduledAction: resolver,
    value: resolver,
  },
  // Device: {
  //   sensors: resolver,
  // },
  AutomaticAction: {
    actions: resolver,
    sensor: resolver,
  },
  ScheduledAction: {
    actions: resolver,
  },
  Action: {
    sensor: resolver,
    automaticAction: resolver,
    scheduledAction: resolver,
  },
  Sensor: {
    // device: resolver,
    automaticActions: resolver,
  },
  Value: {
    sensor: resolver,
  }
}

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint: '/api/v1',
    settings: {
      'editor.reuseHeaders': true,
      'schema.polling.enable': true,
    }
  },
  context: ({ req, res }) => ({ req, res, pubsub }),
})


apollo.applyMiddleware({ app, path: '/' })

const onReady = () => {
  logger.info(`🚀 Server ready at http://${HTTP_HOST}:${HTTP_PORT}${apollo.graphqlPath}`)
  logger.info(`🚀 Subscriptions ready at ws://${HTTP_HOST}:${HTTP_PORT}${apollo.subscriptionsPath}`)
}

const httpServer = http.createServer(app)

apollo.installSubscriptionHandlers(httpServer)

httpServer.listen(HTTP_PORT || 3000, HTTP_HOST || '0.0.0.0', onReady)

amqp.listen(AMQP_APOLLO_QUEUE, listener)
