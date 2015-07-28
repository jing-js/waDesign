module.exports.BaseModel = BaseModel;
module.exports.registerModel = function(app, name, model) {
  var models = app.models || (app.models = {});
  models[name] = model;
};

class BaseModel {
  constructor() {

  }
}