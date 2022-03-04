var gulp = require('gulp');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var tsify = require('tsify');
var babelify = require('babelify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var sass = require('gulp-sass')(require('sass'));
var pug = require('gulp-pug');
var connect = require('gulp-connect');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var log = require('fancy-log');

const package = 'progressive-mine-sweep';
const outDir = 'dist';
const vendor = 'vendor';
const assetEntries = ['assets/**/*'];
const htmlEntries = ['src/index.pug'];
const cssEntries = ['src/index.scss'];
const jsEntries = ['src/index.tsx'];
const externalLibs = ['react', 'react-dom', 'react-router', 'react-router-dom'];
const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json'];

gulp.task('prod', function (done) {
  process.env.NODE_ENV = 'production';
  done();
});

gulp.task('dev', function (done) {
  process.env.NODE_ENV = 'development';
  done();
});

gulp.task('watching', function (done) {
  process.env.watching = true;
  done();
});

gulp.task('assets', function () {
  return gulp
    .src(assetEntries, {
      base: '.',
    })
    .pipe(gulp.dest(outDir));
});

gulp.task('html', function () {
  const debug = (process.env.NODE_ENV !== 'production');
  const htmlName = 'index' + (debug ? '.html' : '.min.html');
  const jsName = package + (debug ? '.js' : '.min.js');
  const cssName = package + (debug ? '.css' : '.min.css');
  const vendorName = vendor + (debug ? '.js' : '.min.js');

  return gulp
    .src(htmlEntries)
    .pipe(pug({
      pretty: debug,
      locals: {
        jsSource: jsName,
        cssSource: cssName,
        vendorSource: vendorName,
      }
    }))
    .pipe(rename(htmlName))
    .pipe(gulp.dest(outDir));
});

gulp.task('sass', function () {
  const debug = (process.env.NODE_ENV !== 'production');
  const cssName = package + (debug ? '.css' : '.min.css');

  return gulp
    .src(cssEntries)
    .pipe(sass({
      includePaths: ['node_modules/uikit/src/scss'],
      outputStyle: (debug ? 'expanded' : 'compressed'),
      outFile: cssName,
    }))
    .pipe(rename(cssName))
    .pipe(gulp.dest(outDir));
});

gulp.task('vendor', function () {
  const debug = (process.env.NODE_ENV !== 'production');
  const bundleName = vendor + (debug ? '.js' : '.min.js');

  let bundler = browserify({
    basedir: '.',
    debug: debug,
  });

  externalLibs.forEach(lib => bundler.require(lib));

  let fs = bundler
    .bundle()
    .pipe(source(bundleName))
    .pipe(buffer());

  if (debug) {
    fs = fs
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
  } else {
    fs = fs
      .pipe(uglify());
  }

  return fs
    .pipe(gulp.dest(outDir));
});

gulp.task('ts', function () {
  return bundle();
});

gulp.task('server', function () {
  connect.server({
    name: package,
    root: outDir,
    port: 8080,
    livereload: true,
  });
});

gulp.task('compile', gulp.parallel('assets', 'html', 'sass', 'vendor', 'ts'));
gulp.task('release', gulp.series('prod', 'compile'));
gulp.task('debug', gulp.series('dev', 'compile'));
gulp.task('watch', gulp.series('dev', 'watching', 'compile'));
gulp.task('start', gulp.series('watch', 'server'));

var bundler = null;

function bundle() {
  const debug = (process.env.NODE_ENV !== 'production');
  const bundleName = package + (debug ? '.js' : '.min.js');

  if (!bundler) {
    bundler = browserify({
      basedir: '.',
      debug: debug,
      entries: jsEntries,
      extensions: extensions,
    })
      .external(externalLibs)
      .plugin(tsify, {
        target: 'ES5',
        module: 'ESNext',
        lib: ['DOM', 'ESNext', 'ScriptHost'],
        allowSyntheticDefaultImports: true,
      })
      .transform(babelify.configure({
        presets: ['@babel/preset-env', '@babel/preset-react'],
        extensions: extensions,
      }));

    if (process.env.watching) {
      bundler = watchify(bundler);
      bundler.on("update", bundle);
      bundler.on("log", log);
    }
  }

  let fs = bundler
    .bundle()
    .pipe(source(bundleName))
    .pipe(buffer());

  if (debug) {
    fs = fs
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
  } else {
    fs = fs
      .pipe(uglify());
  }

  return fs
    .pipe(gulp.dest(outDir))
    .pipe(connect.reload());
}