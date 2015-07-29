var util = require('util');
module.exports = logger;

let instance = null;

function logger(config) {
  if (!instance) {
    instance = new Logger(config);
  }
  return instance;
}
logger.getLogger = function(config) {
  return logger(config);
};

const LEVELS = {
  ALL: 999,
  DEBUG: 4,
  ERROR: 3,
  FATAL: 2,
  INFO: 1,
  WARN: 0,
  OFF: -1
};
const TIPS = ['WARN', 'INFO', 'FATAL', 'ERROR', 'DEBUG'];

class Logger {
  constructor(config) {
    let clog = config.logger || {};
    this.level = LEVELS[clog.level || "OFF"];
    this.allSection = !clog.section || clog.section === 'ALL';
    this.sections = (() => {
      let rtn = {};
      clog.section.split(',').forEach(sec => {
        rtn[sec.trim()] = true;
      });
    })();
  }
  _log(level, section, format, ...args) {
    if (level > this.level) {
      return;
    }
    if (!this.allSection && !this.sections[section]) {
      return;
    }
    if (args.length > 0) {
      console.log(TIPS[level] + ':', util.format(format, ...args));
    } else {
      console.log(TIPS[level] + ':', format);
    }
  }
  log(format, ...args) {
    this._log(LEVELS.INFO, 'ALL', format, ...args);
  }
  logs(section, format, ...args) {
    this._log(LEVELS.INFO, section, format, ...args);
  }
  debug(format, ...args) {
    this._log(LEVELS.DEBUG, 'ALL', format, ...args);
  }
  debugs(section, format, ...args) {
    this._log(LEVELS.DEBUG, section, format, ...args);
  }
  error(format, ...args) {
    this._log(LEVELS.ERROR, 'ALL', format, ...args);
  }
  errors(section, format, ...args) {
    this._log(LEVELS.ERROR, section, format, ...args);
  }
  fatal(format, ...args) {
    this._log(LEVELS.FATAL, 'ALL', format, ...args);
  }
  fatals(section, format, ...args) {
    this._log(LEVELS.FATAL, section, format, ...args);
  }
  info(format, ...args) {
    this._log(LEVELS.INFO, 'ALL', format, ...args);
  }
  infos(section, format, ...args) {
    this._log(LEVELS.INFO, section, format, ...args);
  }
  warn(format, ...args) {
    this._log(LEVELS.WARN, 'ALL', format, ...args);
  }
  warns(section, format, ...args) {
    this._log(LEVELS.WARN, section, format, ...args);
  }
}