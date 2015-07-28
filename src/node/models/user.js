var BaseModel = require('../lib/model.js').BaseModel;

module.exports = class User extends BaseModel{
  constructor() {
    this.name = '';
    this.email = '';
    this.password = '';
  }
};