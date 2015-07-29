var BaseSessionStore = require('./session.js').BaseSessionStroe;
var redis = require('redis');
var EXPIRE_TIME = 1800; //过期时间为30分钟

module.exports = RedisSessionStore;

class RedisSessionStore extends BaseSessionStore {
  constructor(config) {
    super();
    this.redisClient = redis.createClient(config.port, config.host);
    this.redisClient.on('error', err => console.error('redis error:', err));
    this.redisClient.on('ready', () => this.emit('READY'));
    process.on('SIGINT', ()=> this.redisClient.end());
  }
  get(sessionId) {
    return new Promise((resolve, reject) => {

      //每取一次都重新更新过期时间，保证用户每次刷新页面都可以延迟登录过期时间。
      var m = this.redisClient.multi();
      m.get(sessionId);
      m.expire(sessionId, EXPIRE_TIME);
      m.exec(function(err, replies) {
        if (err) {
          reject(err);
        } else {
          resolve(replies[0] ? JSON.parse(replies[0]) : null);
        }
      });

    });
  }
  set(sessionId, value) {
    return new Promise((resolve, reject) => {

      this.redisClient.setex(sessionId, EXPIRE_TIME, JSON.stringify(value), err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

    });
  }
}