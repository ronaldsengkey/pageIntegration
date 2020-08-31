const gulp = require('gulp');
const postcss = require('gulp-postcss');
const precss = require('precss');
const postcssAutomath = require('postcss-automath');
const cssNano = require('cssnano');
const mqpacker = require('css-mqpacker'); // untuk group media query
const sortCSSmq = require('sort-css-media-queries'); // untuk sort media query
const autoprefixer = require('autoprefixer');
const notify = require('gulp-notify');
const livereload = require('gulp-livereload');
const sass = require('gulp-sass');
const rfs = require('rfs');

gulp.task('styles', function () {
    const processors = [
        precss(),
        postcssAutomath(),
        rfs({
            baseValue: '.9rem',
            breakpoint: 1500 // ganti juga di assets/bootstrap/_variables.css
        }),
        autoprefixer({
            grid: true
        }),
        mqpacker({
            sort: sortCSSmq.desktopFirst
        }),
        cssNano()
    ];
   
    return gulp.src(['assets/postcss/custom.css', 'assets/postcss/ext_custom.css', 'assets/postcss/ultipay_button.css', 'assets/postcss/chat.css'])
    .pipe(postcss(processors))
    .pipe(notify('success'))
    .pipe(gulp.dest('public/assets/css'))
    .pipe(gulp.dest('../ultipayPartner/public/assets/css'))
    .pipe(gulp.dest('../marketingDashboard/public/assets/css'))
    .pipe(gulp.dest('../ultipayFinanceDashboard/public/assets/css'))
    .pipe(livereload());
});

gulp.task('bootstrap', function () {
    return gulp.src('assets/bootstrap/bootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(notify('success'))
    .pipe(gulp.dest('public/assets/css'))
    .pipe(gulp.dest('../ultipayPartner/public/assets/css'))
    .pipe(gulp.dest('../marketingDashboard/public/assets/css'))
    .pipe(gulp.dest('../ultipayFinanceDashboard/public/assets/css'))
    .pipe(livereload());
});

gulp.task('mdbootstrap', function () {
    return gulp.src('assets/mdbootstrap/mdbootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(notify('success'))
    .pipe(gulp.dest('public/assets/css'))
    .pipe(gulp.dest('../ultipayPartner/public/assets/css'))
    .pipe(gulp.dest('../marketingDashboard/public/assets/css'))
    .pipe(gulp.dest('../ultipayFinanceDashboard/public/assets/css'))
    .pipe(livereload());
});

gulp.task('watch:styles', function () {
    livereload.listen();
    gulp.watch(['assets/postcss/*.css', 'assets/bootstrap/*.scss', 'assets/mdbootstrap/*.scss'], gulp.series(['bootstrap', 'styles', 'mdbootstrap']));
});