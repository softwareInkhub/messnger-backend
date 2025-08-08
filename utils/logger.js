const { LOG_LEVEL } = require('../config/constants');

class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    console.log(JSON.stringify(logEntry));
  }

  static info(message, data = null) {
    this.log('INFO', message, data);
  }

  static error(message, data = null) {
    this.log('ERROR', message, data);
  }

  static warn(message, data = null) {
    this.log('WARN', message, data);
  }

  static debug(message, data = null) {
    if (LOG_LEVEL === 'debug') {
      this.log('DEBUG', message, data);
    }
  }
}

module.exports = Logger;
