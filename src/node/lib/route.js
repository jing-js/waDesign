'use strict';

var _ = require('lodash');
var routeList = [];
var isG = require('./is.js').isGeneratorFunction;

module.exports = function midware(app) {
  app.get = get;
  app.post = post;
  app.put = put;
  app.del = del;
  app.head = head;

  return function* dealRoute(next) {
    let url = this.request.originalUrl;
    for (let i = 0; i < routeList.length; i++) {
      let r = routeList[i].urlRegExp;
      let fn = routeList[i].routeFn;
      let cl = routeList[i].roleChecks;
      let med = routeList[i].method;
      /*
       * roleCheckReplies用于储存权限判断链路里面的权限函数的返回值。
       * 如果权限函数返回false/undefined/null则表明权限不通过，直接抛出401异常；
       * 否则，权限函数可以返回true/或其它可用的值。
       *
       * 这样做是基于以下考虑：在某次请求中，权限函数会先读取数据库看有没有相应权限，
       *   而之后的route处理函数也会需要读取同一份数据。为了减少数据库访问，可以把
       *   权限函数读到的数据直接传递给route函数。
       * 目前的做法是通过参数列表传递route的参数和roleCheckReplies，因此比较隐晦，
       *   之后可以改进为通过koa的context传递。
       */
      let roleCheckReplies = new Array(cl.length);
      if (this.request.method !== med) {
        continue;
      }
      let checkPass = true;
      for (let j = 0; j < cl.length; j++) {
        let checkFn = cl[i];
        let checkResult = yield checkFn.apply(this, roleCheckReplies);
        if (checkResult === false || checkResult === null || typeof checkResult === 'undefined') {
          checkPass = false;
          break;
        } else {
          roleCheckReplies[j] = checkResult;
        }
      }
      if (!checkPass) {
        this.throw(401, 'access_denied');
        break;
      }
      let m = url.match(r);
      let args = m ? m.slice(0).concat(roleCheckReplies) : null;
      if (args !== null) {
        yield fn.apply(this, args);
        break; //目前的策略采用唯一性route，一但某个route匹配，则不再判断其它route是否匹配。
      }
    }

    yield next;
  }
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
  console.log('add route', method, url, urlRegExp);
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