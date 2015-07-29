
module.exports = BaseDatabaseStore;

class BaseDatabaseStore {
  constructor() {
    this.listeners = {
      READY: []
    };
    this.ready = false;
  }
  onReady(callback) {
    this.listeners.READY.push(callback);
  }
  emit(eventName, ...args) {
    this.listeners[eventName].forEach(cb => cb(...args));
  }
}