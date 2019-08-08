import amqp from "";
import winston from "winston"
import joi from "joi"

import create from './create'
import update from './update'
import { read_all, read_one } from './read'
import remove from './remove'

const logger = winston.createLogger();

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

    try {
        switch (message.info.action) {
            case 'CREATE':
                return create(message)
            case 'UPDATE':
                return update(message)
            case 'READ':
                return read_one(message)
            case 'READ_ALL':
                return read_all(message)
            case 'DELETE':
                return remove(message)
        }
    } catch (err) {
        logger.error('ERROR', err)
    }
}

amqp.on(process.env.AMQP_DEVICE_QUEUE, listener);
