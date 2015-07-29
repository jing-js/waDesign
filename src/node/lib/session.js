var UserModel = require('../models/user.js');
module.exports = session;

function session(app) {
  return function*(next) {
    this.session = yield getUser(this);
    yield next;
  };
}

session.BaseSessionStroe = BaseSessionStore;
session.SessionUser = SessionUser;

function* getUser(ctx) {
  let user = new SessionUser();
  let sid = ctx.cookie.get('NODESESSION'); //fetch cookie
  let ru;

  if (sid && (ru = yield ctx.sessionStore.get(sid))) {
    user.name = ru.name;
    user.email = ru.email;
    user.id = ru.id;
    user.isLogin = true;
    user.sessionId = sid;
  } else {
    user.sessionId = gSessionId();
    ctx.cookie.set('NODESESSION', user.sessionId);
  }
  return user;
}

class SessionUser {
  constructor() {
    this.id = '';
    this.sessionId = '';
    this.name = '';
    this.email = '';
    this.isLogin = false;
  }
  login(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.isLogin = true;
    return sessionStore.set(this.sessionId, {
      id: user.id,
      name: user.name,
      email: user.email
    });
  }
}

function gSessionId() {

}

class BaseSessionStore {
  constructor() {
    this.listeners = {
      READY: []
    }
  }
  onReady(callback) {
    this.listeners.READY.push(callback);
  }
  get() {

  }
  set() {

  }
  emit(eventName, ...args) {
    this.listeners[eventName].forEach(cb => cb(...args));
  }
}