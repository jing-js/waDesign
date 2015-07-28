'use strict';

var config = require('./conf.json');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');

var app = require('./lib/app.js')(config);

/*
 * config router
 */
app.get('/', app.controllers.index);
app.post('/login', app.controllers.user.login);
app.post('/save', app.roles.user.can('save'), app.controllers.user.save);
