import {
    createLogger,
    format,
    transports
} from 'winston';

const logger = createLogger({
    level: 'debug',
    format: format.combine(format.timestamp(), format.printf((info) => {
        const {
            timestamp,
            level,
            message
        } = info;
        return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })),
    transports: [new transports.Console(), new transports.File({ filename: 'total.log' })]
});

export default logger;
