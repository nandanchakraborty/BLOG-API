const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Only log things 'info' level and above
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(), // Output to terminal
    new winston.transports.File({ filename: 'app.log' }) // Also save to a file!
  ],
});

module.exports = logger;