var frep = require('gulp-frep');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var mustache = require("gulp-mustache");
var ugilfy = require('gulp-uglifyjs');
var less = require('gulp-less');
var concat = require('gulp-concat');
var gdata = require('gulp-data');
var cssmin = require('gulp-minify-css');
var angularTemplates = require('gulp-angular-templatecache');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

var processRoot = process.cwd();

function log() {
  gutil.log.apply(gutil, arguments);
}

module.exports = function(gulp, config) {
  var src = config.source;
  var tar = config.target;
  var res = config.resource;
  var loc = res.locale;
  gulp.task('generate', function() {
    return gulp
      .src(path.join(src.root, 'index.htm'))
      .pipe(mustache({
        DEBUG: true,
        PRODUCT: tar.name,
        PREFIX: tar.prefix,
        TITLE: tar.title,
        LOCALE: JSON.stringify({
          enable: loc.enable,
          map: loc.map
        }),
        IMAGE_ROOT: path.relative(src.root, path.join(res.root, res.image.root)),
        LOCALE_ROOT: path.relative(src.root, path.join(res.root, res.locale.root))
      }))
      .pipe(inject_scripts())
      .pipe(inject_styles())
      .pipe(inject_resource_load())
      .pipe(rename('index.html'))
      .pipe(gulp.dest(src.root));
  });
  gulp.task('build', function(cb) {
    return runSequence('clean',
      ['libs', 'resources'], 'app',
      'templates',  'clean-template', cb);
  });
  gulp.task('app', function() {
    gulp
      .src(path.join(src.root, 'index.htm'))
      .pipe(mustache({
        DEBUG: false,
        PRODUCT: tar.name
      }))
      .pipe(rename('index.html'))
      .pipe(gulp.dest(tar.root));

    gulp
      .src(path.join(src.root, 'app.js'))
      .pipe(gulp.dest('build'));


    gulp
      .src(src.styles.map(s => path.join(src.root, s)))
      .pipe(less())
      .pipe(concat())
      .pipe(cssmin())
      .pipe(rename(tar.name + '.min.css'))
      .pipe(gulp.dest(tar.root));

    return gulp
      .src(src.scripts.map(s => path.join(src.root, s)))
      .pipe(gdata((file) => {
        if (/\/template\.js$/.test(file.path)) {
          file.contents = new Buffer(deal_template(file.contents.toString()));
        }
        return file;
      }))
      .pipe(ugilfy(tar.name +  '.min.js', {
        outSourceMap: false
      }))
      .pipe(gulp.dest(tar.root));

  });
  gulp.task('libs', function() {
    return gulp
      .src(src.libs.map(file => path.join(src.root, file)))
      .pipe(gulp.dest(path.join(tar.root, 'lib')));
  });
  gulp.task('clean', function() {
    return gulp
      .src(config.target.root)
      .pipe(clean());
  });
  gulp.task('template', function() {
    var tar = config.target;
    return gulp
      .src(path.join(tar.root, '_template/*.html'))
      .pipe(angularTemplates({
        module: tar.name
      }))
      .pipe(rename(tar.name + '.template.js'))
      .pipe(gulp.dest(tar.root));
  });
  gulp.task('clean-template', function() {
    return gulp
      .src(path.join(tar.root, '_template'))
      .pipe(clean());
  });
  gulp.task('resources', function() {
    return gulp
      .src(path.join(res.root, '**/*'))
      .pipe(gulp.dest(path.join(tar.root, 'resource')));
  });


  function deal_template(cnt) {
    var id = 0;
    function convert(file) {
      var n = 't.'+ (id++) + '.html';
      gulp.src(path.join(src.root, file))
        .pipe(rename(n))
        .pipe(gulp.dest(path.join(src.root, '_template')));
      return n;
    }
    cnt = cnt.replace(/(\'[^']+\')\s*:\s*\'([^']+)\'/g, (m, key, file) => {
      var new_file = convert(file);
      return key + ': \'' + new_file + '\'';
    });
    return cnt;
  }


  function inject_styles() {
    var arr = _.uniq(src.styles.reduce(
      (ps, cs) => ps.concat(glob.sync(path.join(src.root, cs))), []
    )).map(s => s.replace(/\.less$/, '.css'));
    var rel = path.join(processRoot, src.root);
    return frep([{
      pattern: /<!-- Style -->[\n\s]*<!-- Style End -->/,
      replacement: arr.map(file => `<link rel="stylesheet" href="${path.relative(rel, file)}"/>`).join('\n  ')
    }]);
  }


  function inject_scripts() {
    var rel = path.join(processRoot, src.root);
    var arr = _.uniq(src.scripts.reduce(
      (ps, cs) => ps.concat(glob.sync(path.join(src.root, cs))), []
    )).map(file => `"${path.relative(rel, file)}"`);
    return frep([{
      pattern: /<!-- Script -->[\n\s]*<!-- Script End -->/,
      replacement: arr.join(',\n')
    }]);
  }

  function inject_resource_load() {
    var ir = path.join(res.root, res.image.root);
    var arr = res.image.load.reduce((ps, cs) => ps.concat(glob.sync(path.join(ir, cs))), []).map(s => {
      var filename = path.basename(s);
      return `"${filename.substring(0, filename.lastIndexOf('.')).toUpperCase()}" : "${path.relative(ir, s)}"`;
    });
    return frep([{
      pattern: /<!-- Image -->[\n\s]*<!-- Image End -->/,
      replacement: arr.join(',\n')
    }]);
  }

};
