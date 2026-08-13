import { format, createLogger, transports } from "winston";

const { combine, timestamp, json, colorize } = format;

// Custom format for console logging
const consoleFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return `${level}: ${message} :${timestamp}`;
    })
);

// Creating a Winston Logger
const winstonLogger = createLogger({
    level: 'info',
    format: combine(colorize(), timestamp(), json()),
    transports: [
        new transports.Console({ format: consoleFormat }),
        new transports.File({ filename: "./public/logs/app.log" })
    ],
});

export default winstonLogger;