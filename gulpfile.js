var config = {
  server: {
    port: 8088,
    delay: 0,
    proxy: {
      list: [],
      url: 'http://ge.me:8099'
    },
    mock: {
      root: 'mock'
    }
  },

  target: {
    name: 'waDesign',
    root: 'build',
    title: 'waDesign - Design For Web',
    prefix: 'wa'
  },
  resource: {
    root: 'resource',
    locale: {
      root: '_locales',
      enable: true, //如果false则不启用多语言功能。
      map: {
        'zh-CN': '简体中文',
        'en': 'English'
      }
    },
    image: {
      root: 'images',
      load: ['toolbar_buttons/*.*']
    }
  },
  source: {
    root: 'src/front',
    libs: [
      'bower_components/lodash/lodash.min.js',
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/angular/angular.min.js'
    ],
    scripts: [
      'service/**/*.js',
      'model/**/*.js',
      'view/**/*.js'
    ],
    styles: [
      'theme/style.less',
      'theme/layout.less',
      'theme/component.less',
      'theme/**/*.less',
      'view/**/*.less'
    ]
  }
};
var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');

require('./gulp/build.js')(gulp, config);
require('./gulp/server.js')(gulp, config);

function log() {
  gutil.log.apply(gutil, arguments);
}


gulp.task('default', ['generate', 'build', 'server'], function() {
});

gulp.task('server', ['node'], function() {
  log('Server Listening on ' + gutil.colors.cyan('http://localhost:' + config.server.port));
});
