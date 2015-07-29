'use strict';

var config = require('./conf.json');
var framework = require('./lib/app.js');
var app = framework.app(config);
var logger = framework.logger(config);

/*
 * config router
 */
app.get('/', app.controllers.index);
app.post('/login', app.controllers.user.login);
app.post('/save', app.roles.user.can('save'), app.controllers.user.save);

/*
 * start listening
 */
app.onReady = function() {
  app.listen(config.server.port);
};