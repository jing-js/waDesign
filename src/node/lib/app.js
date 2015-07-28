var mongo = require('mongoose');
var _ = require('underscore');
var redis = require('redis');
var redisClient;
var koa = require('koa');

module.exports = function(config) {
  var app = koa();

  app.context.sendAjax = sendAjax;

  if (config.server.access_control_allow_origin) {
    app.use(function* setAccessControl() {
      this.set('Access-Control-Allow-Origin', config.server.access_control_allow_origin);
    });
  }

  loopLoad(app, 'roles', registerRole);
  loopLoad(app, 'controllers', registerController);

  /*
   * disconnect everything on exit
   */
  process.on('SIGINT', function() {
    console.log('disconnect, bye.');
    mongo.disconnect();
    redisClient.end();
    process.exit(0);
  });

  /*
   * run
   */
  mongo.connect(config.mongodb.connect);
  mongo.connection.on('error', err => console.error('mongoose error:', err));
  mongo.connection.once('open', () => {
    redisClient = redis.createClient(config.redis.port, config.redis.host);
    redisClient.on('error', err => console.error('redis error:', err));
    redisClient.on('ready', () => {
      app.redis = redisClient;
      app.listen(config.server.port);
    });
  });

  return app;
};

function sendAjax(success, data) {
  if (!_.isBoolean(success)) {
    data = success;
    success = true;
  }
  this.body = JSON.stringify({
    success: success,
    data: data
  });
}

function loopLoad(app, namespace, handler) {
  let root = process.cwd();
  let ns = app[namespace] || (app[namespace] = {});

  function rd(nsp, dir) {
    fs.readdirSync(dir).forEach(file => {
      let path = path.join(dir, file);
      let name = path.basename(path, '.js');
      if (!fs.statSync(path).isDirectory()) {
        handler(nsp, name, require(path));
      } else {
        let cn = nsp[name] || (nsp[name] = {});
        rd(cn, path);
      }
    });
  }
  rd(ns, path.join(root, namespace));
}

function registerRole(ns, name, accessList) {
  let role = ns[name] || (ns[name] = {});
  for(let k in accessList) {
    let fn = accessList[k];
    if (!_.isFunction(fn)) {
      console.warn('register role error: need function');
    } else if (Object.hasOwnProperty(role, k)) {
      console.error('register role error: already exist');
    } else {
      role[k] = fn;
    }
  }
}
function registerController(ns, name, handlers) {
  ns[name] = handlers;
}