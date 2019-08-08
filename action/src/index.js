import amqp from "amqplib"
import winston from "winston"

amqplib.connect('amqp://localhost')

import create from './create'

const logger = winston.createLogger()

const listener = (message) => {
    logger.info("MESSAGE:", message)

    try {
        switch (message.info.action) {
            case 'CREATE':
                return create(message)
                break;
            case 'UPDATE':
                break;
            case 'READ':
                break;
            case 'READ_ALL':
                break;
            case 'DELETE':
                break;
        }
    } catch (err) {
        logger.error('ERROR', err)
    }
}

amqp.on(process.env.AMQP_ACTION_QUEUE, listener)
