const { src, dest, task, series, watch, parallel } = require('gulp');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');


sass.compiler = require('node-sass');

const styles = [
    'node_modules/normalize.css/normalize.css',
    'src/styles/main.scss'
   ];

const { SRC_PATH, DIST_PATH } = require('./gulp.config');

task('clean', () => {
    return src(`${DIST_PATH}/**/*`, { read: false })
        .pipe(rm());
});

task('copy:html', () => {
    return src(`${SRC_PATH}/*.html`)
        .pipe(dest(`${DIST_PATH}`))
        .pipe(reload({ stream: true }));
});

task('images', () => {
    return src(`${SRC_PATH}/img/**/*`)
        .pipe(dest(`${DIST_PATH}/img`))
        .pipe(reload({ stream: true }));
});

task('styles', () => {
    return src(styles)
        .pipe(concat('main.min.scss'))
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(dest(`${DIST_PATH}/css`))
        .pipe(reload({ stream: true }));
});

task('copy:fonts', () => {
    return src(`${SRC_PATH}/fonts/**/*`)
        .pipe(dest(`${DIST_PATH}/fonts`));
});

task('watch', () => {
    watch(`./${SRC_PATH}/styles/**/*.scss`, series('styles'));
    watch(`./${SRC_PATH}/*.html`, series('copy:html'));
    //watch(`./${SRC_PATH}/js/*.js`, series('scripts'));
    watch(`${SRC_PATH}/img/**/*`, series('images'));
});

task('server', () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        //open: false
    });
});

task('build', 
    series('clean',
        parallel('copy:html', 'styles', 'images', 'copy:fonts')));

task('default',
    series('build',
        parallel('watch', 'server')));