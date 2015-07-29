var UserModel = require('../models/user.js');

module.exports = {
  *login() {
    var req = this.request.params;
    let user = yield UserModel.findOne({
      email: req.email,
      password: req.password
    }, {
      fields: ['id', 'email', 'name']
    });
    if (user) {
      yield this.user.login(user);
      this.sendAjax(true, this.user);
    } else {
      this.sendAjax(false, 'email or password wrong.');
    }
  }
};