import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import errors from 'restify-errors' // { HttpError, NotFoundError }

import { logger } from './lib/index.js'
import * as routes from './routes/index.js'

const { BASE_URL, HTTP_PORT, HTTP_HOST } = process.env
const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use(BASE_URL, routes.action)
app.use(BASE_URL, routes.automaticAction)
app.use(BASE_URL, routes.device)
app.use(BASE_URL, routes.scheduledAction)
app.use(BASE_URL, routes.value)

app.use((req, res, next) => {
  next(new errors.NotFoundError(`Could not find path ${req.originalUrl}. Not found`, 404))
})

// eslint-disable-next-line
app.use(function (err, req, res, next) {
  const DEFAULT_ERR_MSG = 'An error occured. Please contact system administrator'

  logger.error(err)

  if (err instanceof errors.HttpError) {
    res.status(err.statusCode || 500).json({
      errorMessage: err.message || DEFAULT_ERR_MSG,
      status: err.statusCode || 500,
    })
  } else {
    res.status(500).json({
      message: DEFAULT_ERR_MSG,
    })
  }
})

const onReady = () => logger.info(`[HTTP] Gateway listening http://${HTTP_HOST}:${HTTP_PORT}`)

http.createServer(app).listen(HTTP_PORT, HTTP_HOST, onReady)

const gracefulShutdown = () => this.stop()
  .then(() => logger.info('Service stopped, terminating...'))
  .then(() => process.exit(), () => process.exit())

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
