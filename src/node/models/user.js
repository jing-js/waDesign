var BaseModel = require('../lib/app.js').BaseModel;

module.exports = class User extends BaseModel {
  constructor() {
    this.name = '';
    this.email = '';
    this.password = '';
  }
};