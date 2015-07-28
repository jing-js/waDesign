var UserModel = require('../models/user.js');

module.exports = function(app) {
  app.context.__defineGetter__('redis', function() {
    return app.redis;
  });
  app.use(function*() {
    this.user = yield getUser(this);
  });
};

function* getUser(ctx) {
  let user = new SessionUser();
  let sid = ctx.get('JSSESSION'); //fetch cookie
  let redis = this.redis;
}

class SessionUser {
  constructor() {
    this.user = new UserModel();
    this.isLogin = false;
  }
  login(email, password) {
    if (email === 'xiaoge' && password === 'xaioge') {
      this.isLogin = true;
      this.name = '羽航';
    }
    return this.isLogin;
  }
}