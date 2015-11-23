var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var header = require('gulp-header');
var stylish = require('jshint-stylish');

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @author <%= pkg.author %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('lint', function() {
    return gulp.src(['./promise-monitor.js', './http-interceptor.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['lint'], function() {
    return gulp.src(['./promise-monitor.js', './http-interceptor.js'])
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(concat('eyecatch.promise-monitor.js'))
        .pipe(gulp.dest('../dist'));
});

gulp.task('minify', function() {
    return gulp.src('../dist/eyecatch.promise-monitor.js')
        .pipe(concat('eyecatch.promise-monitor.min.js'))
        .pipe(sourcemaps.init())
        .pipe(uglify({preserveComments: 'all'}))
        .pipe(sourcemaps.write('../dist'))
        .pipe(gulp.dest('../dist'));
});

gulp.task('watch', function() {
    gulp.watch(['./promise-monitor.js', './http-interceptor.js'], ['build']);
    gulp.watch('../dist/eyecatch.promise-monitor.js', ['minify']);
});

gulp.task('default', ['build', 'watch']);
