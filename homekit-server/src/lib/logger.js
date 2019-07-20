import winston from 'winston'
import { inspect } from 'util'

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

const format = ({ level, message, timestamp }) => `${timestamp} [${level}]: ${inspect(message, { colors: true })}`

logger.add(new winston.transports.Console({
    colorize: true,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize({ level: true }),
        winston.format.printf(format),
    )
}));

export default logger;
