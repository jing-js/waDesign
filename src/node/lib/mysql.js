'use strict';

var BaseDatabaseStore = require('./database.js').BaseDatabaseStore;
var mysql = require('mysql');

module.exports = MySQLDatabase;

class MySQLDatabase extends BaseDatabaseStore {
  constructor(config) {
    super();
    this.db = mysql.createPool({
      connectionLimit: config.connectionLimit,
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database || config.schema
    });
    this.db.on('error', err => console.error('database error:', err));
    this.db.on('connection', () => this.emit('READY'));
    process.on('SIGINT', () => this.db.end());
  }

}