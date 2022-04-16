const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const fs = require('fs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const htmlPretty = require('gulp-pretty-html');
const log = require('fancy-log');
const realFavicon = require('gulp-real-favicon');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass')(require('sass'));
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const watchify = require('watchify');

const package = 'progressive-mine-sweep';
const outDir = 'dist';
const vendor = 'vendor';
const githubPagesDir = '../lepouya.github.io';
const favIconDataFile = 'faviconData.json';
const favIconsDir = 'assets/icons';
const favIconMasterPicture = 'land-mine.png';
const assetEntries = ['assets/**/*'];
const htmlEntries = ['src/index.html'];
const cssEntries = ['src/**/*.scss'];
const jsEntries = ['src/index.tsx'];
const externalLibs = ['react', 'react-dom', 'react-router', 'react-router-dom', '@tabler/icons'];
const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json'];
const watchStreams = [];

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
  const favIconData = JSON.parse(fs.readFileSync(favIconDataFile));

  let stream = gulp
    .src(htmlEntries)
    .pipe(replace('{jsSource}', jsName))
    .pipe(replace('{cssSource}', cssName))
    .pipe(replace('{vendorSource}', vendorName))
    .pipe(replace('{favIconCode}', favIconData.favicon.html_code))
    .pipe(realFavicon.injectFaviconMarkups(favIconData.favicon.html_code));

  if (debug) {
    stream = stream
      .pipe(htmlPretty({
        indent_inner_html: true
      }))
  } else {
    stream = stream
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }));
  }

  stream = stream
    .pipe(rename(htmlName))
    .pipe(gulp.dest(outDir));

  if (process.env.watching) {
    stream = stream
      .pipe(connect.reload());

    const watcher = gulp.watch(htmlEntries, gulp.series('html'));
    watchStreams.push(watcher);
  }

  return stream;
});

gulp.task('sass', function () {
  const debug = (process.env.NODE_ENV !== 'production');
  const cssName = package + (debug ? '.css' : '.min.css');

  let stream = gulp
    .src(cssEntries)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: (debug ? 'expanded' : 'compressed'),
      outFile: cssName,
    }))
    .pipe(concat('style.css'))
    .pipe(rename(cssName));

  if (debug) {
    stream = stream
      .pipe(sourcemaps.write('./'))
  } else {
    stream = stream
      .pipe(cleanCss());
  }

  stream = stream
    .pipe(gulp.dest(outDir));

  if (process.env.watching) {
    stream = stream
      .pipe(connect.reload());

    const watcher = gulp.watch(cssEntries, gulp.series('sass'));
    watchStreams.push(watcher);
  }

  return stream;
});

gulp.task('vendor', function () {
  const debug = (process.env.NODE_ENV !== 'production');
  const bundleName = vendor + (debug ? '.js' : '.min.js');

  let bundler = browserify({
    basedir: '.',
    debug: debug,
  });

  externalLibs.forEach(lib => bundler.require(lib));

  let stream = bundler
    .bundle()
    .pipe(source(bundleName))
    .pipe(buffer());

  if (debug) {
    stream = stream
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
  } else {
    stream = stream
      .pipe(uglify());
  }

  return stream
    .pipe(gulp.dest(outDir));
});

gulp.task('ts', function () {
  return bundle();
});

gulp.task('server', function (done) {
  connect.server({
    name: package,
    root: outDir,
    port: 8080,
    livereload: true,
    middleware: function () {
      return [function (req, res, next) {
        if (/_kill_\/?/.test(req.url)) {
          res.end();
          connect.serverClose();
          watchStreams.forEach(stream => stream.close());
          done();
        }
        next();
      }];
    }
  });
});

gulp.task('generate-favicon', function (done) {
  realFavicon.generateFavicon({
    masterPicture: favIconsDir + '/' + favIconMasterPicture,
    dest: favIconsDir,
    iconsPath: favIconsDir + '/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '14%',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        }
      },
      desktopBrowser: {
        design: 'raw'
      },
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#da532c',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        }
      },
      androidChrome: {
        pictureAspect: 'noChange',
        themeColor: '#ffffff',
        manifest: {
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#990000'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false,
      readmeFile: false,
      htmlCodeFile: false,
      usePathAsIs: false
    },
    markupFile: favIconDataFile
  }, function () {
    done();
  });
});

gulp.task('favicon', function (done) {
  var currentVersion = JSON.parse(fs.readFileSync(favIconDataFile)).version;
  realFavicon.checkForUpdates(currentVersion, function (err) {
    if (err) {
      gulp.start('generate-favicon');
    }
    done();
  });
});

gulp.task('copy-dist', function () {
  const debug = (process.env.NODE_ENV !== 'production');
  const htmlName = 'index' + (debug ? '.html' : '.min.html');
  const jsName = package + (debug ? '.js' : '.min.js');
  const cssName = package + (debug ? '.css' : '.min.css');
  const vendorName = vendor + (debug ? '.js' : '.min.js');

  return gulp
    .src(
      [htmlName, jsName, cssName, vendorName]
        .concat(assetEntries)
        .map(f => outDir + '/' + f))
    .pipe(rename(path => {
      if (path.basename == 'index.min') {
        path.basename = 'index';
      }
    }))
    .pipe(gulp.dest(githubPagesDir + '/' + package));
});

gulp.task('compile',
  gulp.series(
    'favicon',
    gulp.parallel(
      'assets',
      'html',
      'sass',
      'vendor',
      'ts'
    )
  )
);

gulp.task('release', gulp.series('prod', 'compile'));
gulp.task('debug', gulp.series('dev', 'compile'));
gulp.task('watch', gulp.series('dev', 'watching', 'compile'));
gulp.task('start', gulp.series('watch', 'server'));
gulp.task('github-release', gulp.series('release', 'copy-dist'));

let bundler = null;
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
        target: 'ES6',
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
      watchStreams.push(bundler);
    }
  }

  let stream = bundler
    .bundle()
    .pipe(source(bundleName))
    .pipe(buffer());

  if (debug) {
    stream = stream
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
  } else {
    stream = stream
      .pipe(uglify());
  }

  stream = stream
    .pipe(gulp.dest(outDir));

  if (process.env.watching) {
    stream = stream
      .pipe(connect.reload());
  }

  return stream;
}