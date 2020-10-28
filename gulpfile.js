const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const del = require('del');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const svgSprite = require('gulp-svg-sprite');
const gulpStylelint = require('gulp-stylelint');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');

gulp.task('clean', async () => {
    del.sync('dist');
});

gulp.task('lint-css', function lintCssTask() {
    return gulp.src(['app/css/*.css', '!app/css/index.min.css']).pipe(
        gulpStylelint({
            reporters: [{formatter: 'string', console: true}],
        })
    );
});

gulp.task('fix-css', function fixCssTask() {
    return gulp
        .src('app/css/style.css')
        .pipe(
            gulpStylelint({
                fix: true,
            })
        )
        .pipe(gulp.dest('src'));
});

gulp.task('eslint', function fixCssTask() {
    return gulp
        .src(['app/scripts/*.js', '!app/scripts/index.min.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('svgSprite', function () {
    return gulp
        .src('app/img/svg/*.svg')
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../sprite.svg',
                    },
                },
            })
        )
        .pipe(gulp.dest('app/img'));
});

gulp.task('css', () => {
    return gulp
        .src(['app/css/index.min.css', 'app/css/index.min.css.map'])
        .pipe(gulp.dest('dist/css'));
});

gulp.task('styles', () => {
    return gulp
        .src([
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'app/css/style.css',
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('index.min.css'))
        .pipe(postcss([autoprefixer({grid: 'autoplace'}), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('export', async () => {
    gulp.src(['app/img/*', '!app/img/svg']).pipe(gulp.dest('dist/img'));
});

gulp.task('html', () => {
    return gulp
        .src('app/*.html')
        .pipe(
            htmlmin({
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true,
                continueOnParseError: true,
                removeAttributeQuotes: true,
            })
        )
        .pipe(gulp.dest('dist'));
});

gulp.task('js', () => {
    return gulp.src(['app/js/index.min.js']).pipe(gulp.dest('dist/js'));
});

gulp.task('scripts', () => {
    return gulp
        .src(['app/js/index.js'])
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(concat('index.min.js'))
        .pipe(terser())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

// Static Server + watching html/css files
gulp.task('serve', () => {
    browserSync.init({
        server: 'app/',
    });

    gulp.watch('app/index.html').on('change', browserSync.reload);
    gulp.watch('app/img/svg/**').on(
        'change',
        gulp.series('svgSprite', browserSync.reload)
    );
    gulp.watch('app/img/**').on('change', browserSync.reload);
    gulp.watch(['app/css/**', '!app/**/*.min.**']).on(
        'change',
        gulp.series('styles', browserSync.reload)
    );
    gulp.watch(['app/js/**', '!app/**/*.min.**']).on(
        'change',
        gulp.series('scripts', browserSync.reload)
    );
});

gulp.task(
    'build',
    gulp.series(
        gulp.parallel('lint-css', 'eslint'),
        gulp.parallel('clean', 'styles', 'scripts'),
        gulp.parallel('export', 'html', 'css', 'js')
    )
);

gulp.task(
    'default',

    gulp.parallel(
        'lint-css',
        'styles',
        'eslint',
        'scripts',
        'svgSprite',
        'serve'
    )
);
