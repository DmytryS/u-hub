import amqp from 'amqplib';
import winston from 'winston';
// import joi from "joi"

import create from './create';
import update from './update';
import { readAll, readOne } from './read';
import remove from './remove';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`),
  ),
  transports: [new winston.transports.Console()],
});

// {
//     info: {
//         action: 'CREATE',
//         collection: 'device'
//     },
//     data: { ... },
//     metadata: {
//       skip: '1',
//       limit: '20'
//     }
// }

const listener = async (message) => {
  logger.info('MESSAGE:', message);

  switch (message.info.action) {
    case 'CREATE':
      return create(message);
    case 'UPDATE':
      return update(message);
    case 'READ':
      return readOne(message);
    case 'READ_ALL':
      return readAll(message);
    case 'DELETE':
      return remove(message);
    default:
      throw new Error('Unknown action');
  }
};

amqp.connect(process.env.AMQP_URI).then((conn) => {
  process.once('SIGINT', () => { conn.close(); });
  return conn.createChannel().then((ch) => {
    const q = process.env.AMQP_DEVICE_QUEUE;
    let ok = ch.assertQueue(q, { durable: false });

    ok = ok.then(() => {
      ch.prefetch(1);
      return ch.consume(q, listener);
    });
    return ok.then(() => {
      logger.info('Awaiting RPC requests');
    });
  });
}).catch(logger.warn);
