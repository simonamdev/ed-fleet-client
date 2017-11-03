import gulp from 'gulp';
import sass from 'gulp-sass';

gulp.task('build_sass_dist', () => {
    return gulp.src('./src/sass/app.scss')
   .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
   .pipe(gulp.dest('./src/css'));
});

gulp.task('build_sass', () => {
  return gulp.src('./src/sass/app.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./src/css'));
});
