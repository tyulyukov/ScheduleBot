const winston = require("winston");

const customFormat = winston.format.printf((info) => {
    return `[${info.timestamp}] ${info.level}: ${JSON.stringify(info.message, null, 4)}`;
});

const logger = winston.createLogger({
    format:
        winston.format.combine(
            winston.format.timestamp({
                format: "DD-MM-YYYY HH:mm:ss"
            }),
            winston.format.colorize(),
            customFormat
        ),
    transports: [new winston.transports.Console()],

});

module.exports = logger;