var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('lint', function() {
    return gulp.src(['./promise-monitor.js', './http-interceptor.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['lint'], function() {
    return gulp.src(['./promise-monitor.js', './http-interceptor.js'])
        .pipe(concat({ path: 'eyecatch.promise-monitor.js' }))
        .pipe(gulp.dest('../dist'));
});

gulp.task('minify', function() {
    return gulp.src('../dist/eyecatch.promise-monitor.js')
        .pipe(concat({ path: 'eyecatch.promise-monitor.min.js' }))
        .pipe(uglify({preserveComments: true}))
        .pipe(gulp.dest('../dist'));
});

gulp.task('watch', function() {
    gulp.watch(['./promise-monitor.js', './http-interceptor.js'], ['build']);
    gulp.watch('../dist/eyecatch.promise-monitor.js', ['minify']);
});

gulp.task('default', ['build', 'watch']);
