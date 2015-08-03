'use strict';

var _ = require('lodash');
var koa = require('koa');
var session = require('./session.js');
var route = require('./route.js');

module.exports.logger = require('./logger.js');
module.exports.BaseModel = require('./model.js').BaseModel;
module.exports.BaseSessionStore = session.BaseSessionStroe;
module.exports.BaseDatabaseStore = require('./database.js').BaseDatabaseStore;

module.exports.app = function app(config) {
  var app = koa();

  app.context.sendAjax = sendAjax;

  if (config.server.access_control_allow_origin) {
    app.use(function* setAccessControl(next) {
      this.set('Access-Control-Allow-Origin', config.server.access_control_allow_origin);
      yield next;
    });
  }

  let dbStore;

  if (config.db.type === 'mysql') {
    dbStore = new (require('./mysql.js'))(config.db);

  }

  let sessionStore;
  if (config.session.type === 'redis') {
    sessionStore = new (require('./redis.js'))(config.session);
  }
  app.use(function* injectStore(next) {
    this.db = dbStore;
    this.sessionStore = sessionStore;
    yield next;
  });


  //todo simplify below code. 简化下面代码。
  Promise.all(new Promise(function(resolve) {
    dbStore.onReady(resolve);
  }), new Promise(function(resolve) {
    sessionStore.onReady(resolve);
  })).then(function() {
    app.onReady();
  });

  app.use(session(app));
  app.use(route(app));

  loopLoad(app, 'roles', registerRole);
  loopLoad(app, 'controllers', registerController);


  app.onReady = _.noop;

  process.on('SIGINT', ()=> process.exit(0));
  return app;
};

function sendAjax(success, data) {
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