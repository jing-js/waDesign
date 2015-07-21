var _ = require('lodash');

module.exports = {
  route: function(url, data) {
    if (_.isFunction(data)) {
      return data;
    } else {
      return function(req, res) {
        return data;
      }
    }
  }
};