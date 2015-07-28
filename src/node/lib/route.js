'use strict';

var _ = require('lodash');
var routeList = [];
var isG = require('./is.js').isGeneratorFunction;

module.exports = function(app) {
  app.get = get;
  app.post = post;
  app.put = put;
  app.del = del;
  app.head = head;

  app.use(function* notFound(next) {
    yield next;
    if (!this.body) {
      this.throw(404, 'not_found');
    }
  });
  app.use(function* dealRoute() {
    let url = this.request.originalUrl;
    for (let i = 0; i < routeList.length; i++) {
      let r = routeList[i].urlRegExp;
      let fn = routeList[i].routeFn;
      let cl = routeList[i].roleChecks;
      let med = routeList[i].method;
      if (this.request.method !== med) {
        continue;
      }
      let checkPass = true;
      for (let j = 0; j < cl.length; j++) {
        let checkFn = cl[i];
        let checkResult = isG(checkFn) ? yield checkFn.call(this) : checkFn.call(this);
        if (!checkResult) {
          checkPass = false;
          break;
        }
      }
      if (!checkPass) {
        this.throw(401, 'access_denied');
        break;
      }
      let m = url.match(r);
      let args = m ? m.slice(0) : null;
      if (args !== null) {
        if (isG(fn)) {
          yield fn.apply(this, args);
        } else {
          fn.apply(this, args);
        }
        break;
      }
    }
  });
};


function route(method, url, ...args) {
  if (args.length === 0 || !_.isRegExp(url) && !_.isString(url)) {
    console.error('bad route arguments');
    return;
  }
  var urlRegExp = _.isString(url) ? parse(url) : url;
  var routeFn = args[args.length - 1];
  var roleCheckList = args.slice(0, args.length-1);
  routeList.push({
    method: method,
    urlRegExp: urlRegExp,
    routeFn: routeFn,
    roleChecks: roleCheckList
  });
}

function get(url, ...args) {
  route('GET', url, ...args);
}
function post(url, ...args) {
  route('POST', url, ...args);
}
function put(url, ...args) {
  route('PUT', url, ...args);
}
function del(url, ...args) {
  route('DELETE', url, ...args);
}
function head(url, ...args) {
  route('HEAD', url, ...args);
}

function parseUrl(url) {
  url = url.replace(/\\{1,}/g, '/').replace(/\/{2,}/g, '/');
  if (url[0] !== '/') {
    url = '/' + url;
  }
  return new RegExp(
    url.split('/').map(s => (s && s[0] === ':') ? '([^/]+)' : s).join('/')
  );
}