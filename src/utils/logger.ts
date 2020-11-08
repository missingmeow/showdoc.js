import { join } from 'path';
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'access.log',
      dirname: join(__dirname, '../../logs'),
      level: 'debug',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 30,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}] ${message}`;
      }),
    }),
  );
}

export default logger;
