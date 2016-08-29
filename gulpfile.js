var gulp = require('gulp');
var sh = require('shelljs');
var bower = require('bower');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var replace = require('replace');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var minify = require('gulp-minify');
var annotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');

var paths = {
  sass: ['./scss/**/*.scss'],
  scripts: [
  'www/js/*.module.js',
  'www/js/*.constants.js',
  'www/js/*.route.js',
  'www/js/*.run.js',
  'www/js/**/*.js',
  '!www/js/app-min.js',
  '!www/js/app.js',
  '!www/js/vendors-min.js',
  '!www/js/vendors.js'
  ],
  vendors: [
  'www/lib/ionic/js/ionic.bundle.js',
  'www/lib/satellizer/satellizer.js',
  'www/lib/angular-simple-logger/dist/angular-simple-logger.js',
  'www/lib/moment/min/moment.min.js',
  'www/lib/lodash/dist/lodash.min.js',
  'www/lib/ngCordova/dist/ng-cordova.min.js',
  'www/lib/jquery/dist/jquery.min.js',
  'www/lib/angular-google-maps/dist/angular-google-maps.min.js',
  'www/lib/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
  'www/lib/sails.io.js/dist/sails.io.js'
  ]
};

gulp.task('default', ['sass', 'scripts']);

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(concat('app.js'))
    .pipe(annotate())
    .pipe(minify())
    .pipe(gulp.dest('www/js'))
});

gulp.task('vendors', function() {
  gulp.src(paths.vendors)
    .pipe(concat('vendors.js'))
    .pipe(annotate())
    .pipe(minify())
    .pipe(gulp.dest('www/js'))
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

// JSHint
gulp.task('hint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
});