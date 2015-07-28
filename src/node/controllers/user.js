module.exports = {
  login: function*() {
    var req = this.request.params;
    if (yield this.user.login(req.email, req.password)) {
      this.sendAjax(this.user);
    } else {
      this.sendAjax(false, 'email or password wrong.');
    }
  }
};