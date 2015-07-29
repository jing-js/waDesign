module.exports = {
  "logger": {
    "level": "INFO", // "ALL", "DEBUG", "ERROR", "FATAL", "INFO", "OFF"
    "destination": "CONSOLE", // "FILE:/etc/log/app.log", "url:http://logger.xiaoge.me"
    "section": "ALL" // "custom_section_1, custom_section_2, ..."
  },
  "session" : {
    "type": "redis",
    "port" : 6379,
    "host" : "127.0.0.1"
  },
  "db" : {
    "type": "mysql",
    "host": "127.0.0.1",
    "user": "root",
    "password": "abeajqn",
    "schema": "wa_design",
    "connectionLimit": 10
  },
  "server" : {
    "host" : "0.0.0.0",
    "port" : 9042,
    "access_control_allow_origin" : "*"
  }
};