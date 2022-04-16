const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const fs = require('fs');
const gulp = require('gulp');
const log = require('fancy-log');
const plugins = require('gulp-load-plugins')();
const sass = require('sass');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const watchify = require('watchify');

const package = 'progressive-mine-sweep';
const outDir = 'dist';
const vendorFile = 'vendor';
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
const watchStreams = {};

function prod(done) {
  process.env.NODE_ENV = 'production';
  done();
}

function dev(done) {
  process.env.NODE_ENV = 'development';
  done();
}

function watching(done) {
  process.env.watching = true;
  done();
}

function assets() {
  return gulp
    .src(assetEntries, {
      base: '.',
    })
    .pipe(gulp.dest(outDir));
}

function html() {
  const debug = (process.env.NODE_ENV !== 'production');
  const htmlName = 'index' + (debug ? '.html' : '.min.html');
  const jsName = package + (debug ? '.js' : '.min.js');
  const cssName = package + (debug ? '.css' : '.min.css');
  const vendorName = vendorFile + (debug ? '.js' : '.min.js');
  const favIconData = JSON.parse(fs.readFileSync(favIconDataFile));

  let stream = gulp
    .src(htmlEntries)
    .pipe(plugins.replace('{jsSource}', jsName))
    .pipe(plugins.replace('{cssSource}', cssName))
    .pipe(plugins.replace('{vendorSource}', vendorName))
    .pipe(plugins.replace('{favIconCode}', favIconData.favicon.html_code))
    .pipe(plugins.realFavicon.injectFaviconMarkups(favIconData.favicon.html_code));

  if (debug) {
    stream = stream
      .pipe(plugins.prettyHtml({
        indent_inner_html: true
      }))
  } else {
    stream = stream
      .pipe(plugins.htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }));
  }

  stream = stream
    .pipe(plugins.rename(htmlName))
    .pipe(gulp.dest(outDir));

  if (process.env.watching) {
    stream = stream
      .pipe(plugins.connect.reload());

    if (!watchStreams['html']) {
      const watcher = gulp.watch(htmlEntries, html);
      watchStreams['html'] = watcher;
    }
  }

  return stream;
}

function css() {
  const debug = (process.env.NODE_ENV !== 'production');
  const cssName = package + (debug ? '.css' : '.min.css');

  let stream = gulp
    .src(cssEntries)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass(sass)({
      outputStyle: (debug ? 'expanded' : 'compressed'),
      outFile: cssName,
    }))
    .pipe(plugins.concat('style.css'))
    .pipe(plugins.rename(cssName));

  if (debug) {
    stream = stream
      .pipe(plugins.sourcemaps.write('./'))
  } else {
    stream = stream
      .pipe(plugins.cleanCss());
  }

  stream = stream
    .pipe(gulp.dest(outDir));

  if (process.env.watching) {
    stream = stream
      .pipe(plugins.connect.reload());

    if (!watchStreams['sass']) {
      const watcher = gulp.watch(cssEntries, css);
      watchStreams['sass'] = watcher;
    }
  }

  return stream;
}

function vendor() {
  const debug = (process.env.NODE_ENV !== 'production');
  const bundleName = vendorFile + (debug ? '.js' : '.min.js');

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
      .pipe(plugins.sourcemaps.init({
        loadMaps: true
      }))
      .pipe(plugins.sourcemaps.write('./'))
  } else {
    stream = stream
      .pipe(plugins.uglify());
  }

  return stream
    .pipe(gulp.dest(outDir));
}

function ts() {
  const debug = (process.env.NODE_ENV !== 'production');
  const bundleName = package + (debug ? '.js' : '.min.js');

  let bundler = watchStreams['ts'];
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
      bundler.on("update", ts);
      bundler.on("log", log);
      watchStreams['ts'] = bundler;
    }
  }

  let stream = bundler
    .bundle()
    .pipe(source(bundleName))
    .pipe(buffer());

  if (debug) {
    stream = stream
      .pipe(plugins.sourcemaps.init({
        loadMaps: true
      }))
      .pipe(plugins.sourcemaps.write('./'))
  } else {
    stream = stream
      .pipe(plugins.uglify());
  }

  stream = stream
    .pipe(gulp.dest(outDir));

  if (process.env.watching) {
    stream = stream
      .pipe(plugins.connect.reload());
  }

  return stream;
}

function server(done) {
  plugins.connect.server({
    name: package,
    root: outDir,
    port: 8080,
    livereload: true,
    middleware: function () {
      return [function (req, res, next) {
        if (/_kill_\/?/.test(req.url)) {
          watchStreams.values().forEach(stream => stream.close());
          watchStreams = {};
          plugins.connect.serverClose();
          res.end();
          done();
        }
        next();
      }];
    }
  });
}

function generateFavicon(done) {
  plugins.realFavicon.generateFavicon({
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
}

function favicon(done) {
  var currentVersion = JSON.parse(fs.readFileSync(favIconDataFile)).version;
  plugins.realFavicon.checkForUpdates(currentVersion, function (err) {
    if (err) {
      generateFavicon();
    }
    done();
  });
}

function copyDist() {
  const debug = (process.env.NODE_ENV !== 'production');
  const htmlName = 'index' + (debug ? '.html' : '.min.html');
  const jsName = package + (debug ? '.js' : '.min.js');
  const cssName = package + (debug ? '.css' : '.min.css');
  const vendorName = vendorFile + (debug ? '.js' : '.min.js');

  return gulp
    .src(
      [htmlName, jsName, cssName, vendorName]
        .concat(assetEntries)
        .map(f => outDir + '/' + f))
    .pipe(plugins.rename(path => {
      if (path.basename == 'index.min') {
        path.basename = 'index';
      }
    }))
    .pipe(gulp.dest(githubPagesDir + '/' + package));
}

const compile = gulp.series(favicon, gulp.parallel(assets, html, css, vendor, ts));
const watch = gulp.series(dev, watching, compile);

exports.release = gulp.series(prod, compile);
exports.debug = gulp.series(dev, compile);
exports.start = gulp.series(watch, server);
exports.githubRelease = gulp.series(exports.release, copyDist);
exports.generateFavicon = gulp.series(prod, generateFavicon, favicon);
