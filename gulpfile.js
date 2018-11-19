/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-cssnano gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  livereload = require('gulp-livereload'),
  del = require('del');

// Styles
gulp.task('styles', function () {
  return sass('src/styles/main.scss', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// PWA Service Worker
gulp.task('pwa-service-worker', function () {
  return gulp.src('src/pwa/service-worker.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/pwa'))
    .pipe(notify({ message: 'pwa-service-worker task complete' }));
});

// PWA Manifest
gulp.task('pwa-manifest', function () {
  return gulp.src('src/pwa/manifest.json')
    .pipe(gulp.dest('dist/pwa'))
    .pipe(notify({ message: 'pwa-manifest task complete' }));
});

// Ajax Templates
gulp.task('ajax-templates', function () {
  return gulp.src('views/ajax-templates/**/*.hbs')
    .pipe(gulp.dest('dist/ajax-templates'))
    .pipe(notify({ message: 'ajax-templates task complete' }));
});

// Clean
gulp.task('clean', function () {
  return del(['dist/styles', 'dist/scripts', 'dist/images']);
});

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('styles', 'scripts', 'images', 'pwa-service-worker', 'pwa-manifest', 'ajax-templates');
});

// Watch
gulp.task('watch', function () {

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('src/scripts/**/*.js', ['scripts']);

  // Watch Ajax Templates files
  gulp.watch('views/ajax-templates/**/*.hbs', ['ajax-templates']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch PWA Files
  gulp.watch('src/pwa/manifest.json', ['pwa-manifest']);
  gulp.watch('src/pwa/service-worker.js', ['pwa-service-worker']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});