var logger = require('../lib/app.js').logger();

module.exports = function() {
  this.body = 'Hello!\nHere is waDesign.';
  logger.log('logger');
};