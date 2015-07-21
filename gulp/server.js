var express = require('express');
var _ = require('lodash');
var requireDir = require('require-dir');
var path = require('path');
var http = require('http');
var root = process.cwd();
var httpProxy = require('http-proxy');
var slow = require('connect-slow');
var API = require('./api.js');

function startServer(config) {

  var app = express();
  var server = http.createServer(app);
  app.use('/', express.static(config.source.root));
  if (_.isNumber(config.server.delay) && config.server.delay > 0) {
    app.use(slow({
      delay: config.server.delay
    }));
  }
  var apiFiles = requireDir(path.join(root, config.server.mock.root));
  _.forEach(apiFiles, function(apis) {
    _.forEach(apis, function(handler, url) {
      var method = 'all';
      var tmp, route;
      if (/^(?:GET)|(?:POST)|(?:DELETE)|(?:PUT)\s+/i.test(url)) {
        tmp = url.split(/\s+/);
        method = tmp[0].toLowerCase();
        url = tmp[1];
      }
      route = API.route(url, handler);
      app.route(url)[method](function(req, res) {
        var data = route(req, res);
        if (!_.isUndefined(data)) {
          return res.json(data);
        }
      })
    })
  });


  var proxy = httpProxy.createProxyServer({});

  config.server.proxy.list.forEach(function(url) {
    app.route(url).all(function(req, res) {
      proxy.web(req, res, {
        target: config.server.proxy.url
      });
    })
  });
  proxy.on('error', function(err, req, res) {
    console.error(err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end(err.message);
  });

  var port = config.server && config.server.port || 8000;
  server.listen(port);

}


module.exports = function(gulp, config) {
  gulp.task('node', function() {
    startServer(config);
  });
};