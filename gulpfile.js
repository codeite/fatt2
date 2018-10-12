var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var jshint = require('gulp-jshint')

gulp.task('startServer', function() {
  nodemon({
    script: 'server/app.js',
    ext: 'html js',
    watch: ['server'],
    env: {
      NODE_ENV: 'development'
    }
  }).on('restart', function() {
    return console.log('restarted!')
  })
})

gulp.task('lint', function() {
  return gulp
    .src('./service/**/*.js', './public/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
})

gulp.task('default', ['startServer'], function() {
  gulp.watch['server/**/*.js']
})
