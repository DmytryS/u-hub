import { amqp, logger } from './lib/index.js'

const actionMapping = {
  GET: ['READ', 'READ_ALL'],
  PUT: 'UPDATE',
  POST: 'CREATE',
  DELETE: 'DELETE'
}

// eslint-disable-next-line
const resolver = async (req, res, next) => {
  logger.info(`[HTTP] ${req.method} ${req.path}`)

  const path = req.path.split('/').filter(str => str.length)
  const service = path[0]
  let action

  if (req.method === 'GET') {
    if (path.length > 1) {
      action = actionMapping[req.method][0]
    } else {
      action = actionMapping[req.method][1]
    }
  } else {
    action = actionMapping[req.method]
  }

  const message = {
    info: {
      action,
      service,
    },
    data: {
      ...req.body,
      ...req.request
    }
  }

  if (path.length === 2) {
    message.data.id = path[1]
  }

  let output = false
  try {
    output = await amqp.request(service, message)

    output.id = output._id
    delete output._id
    delete output.__v
  } catch (err) {
    output = {
      message: err.message,
      stack: err.stack
    }
  }

  res.json(output)
}

export default resolver
