'use strict';

var config = require('./conf.js');
var framework = require('./lib/app.js');
var app = framework.app(config);
var logger = framework.logger(config);

/*
 * config router
 */
app.get('/', app.controllers.index);
app.post('/login', app.controllers.user.login);
app.post('/save', app.roles.user.login, app.controllers.user.save);

/*
 * start listening
 */
app.onReady = function() {
  logger.info('start listening at port: %d', config.server.port);
  app.listen(config.server.port);
};