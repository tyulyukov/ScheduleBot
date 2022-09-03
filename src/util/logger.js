const winston = require("winston");

const customFormat = winston.format.printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
    format:
        winston.format.combine(
            winston.format.timestamp({
                format: "DD-MM-YYYY HH:mm:ss"
            }),
            winston.format.colorize(),
            winston.format.align(),
            customFormat
        ),
    transports: [new winston.transports.Console()],

});

module.exports = logger;