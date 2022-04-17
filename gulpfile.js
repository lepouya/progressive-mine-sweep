const babelify = require("babelify");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const envify = require("envify/custom");
const fs = require("fs");
const gulp = require("gulp");
const log = require("fancy-log");
const plugins = require("gulp-load-plugins")();
const sass = require("sass");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const uglifyify = require("uglifyify");
const watchify = require("watchify");

const package = "progressive-mine-sweep";
const outDir = "dist";
const githubPagesDir = "../lepouya.github.io";
const favIconDataFile = "faviconData.json";
const favIconsDir = "assets/icons";
const favIconMasterPicture = "land-mine.png";
const assetEntries = ["assets/**/*"];
const htmlEntries = ["src/index.html"];
const cssEntries = ["src/**/*.scss"];
const jsEntries = ["src/index.tsx"];
const extensions = [".js", ".ts", ".jsx", ".tsx", ".json"];
const externalLibs = {
  react: ["react", "react-dom", "react-router", "react-router-dom"],
  tabler: ["@tabler/icons"],
};
const watchStreams = {};

function injectHtmlDep(dep) {
  const injectStr = (s) => plugins.replace("</head>", s + "\n</head>");
  const formatDep = (s) =>
    s.endsWith(".css")
      ? `<link href="${s}" rel="stylesheet" type="text/css"/>`
      : s.endsWith(".js")
      ? `<script src="${s}" type="text/javascript"></script>`
      : `${s}`;

  if (typeof dep == "string") {
    return injectStr(formatDep(dep));
  } else if (typeof dep == "object") {
    return injectStr(Object.values(dep).map(formatDep).join("\n"));
  }
}

function setEnv(debug, watching) {
  const fn = (done) => {
    process.env.NODE_ENV = debug ? "development" : "production";
    process.env.watching = watching ? "watching" : undefined;
    return done();
  };
  Object.assign(fn, {
    displayName:
      "env:" +
      (debug ? "development" : "production") +
      (!!watching ? "+watching" : ""),
  });
  return fn;
}

function assets() {
  return gulp.src(assetEntries, { base: "." }).pipe(gulp.dest(outDir));
}

function html() {
  const debug = process.env.NODE_ENV !== "production";
  const min = debug ? "" : ".min";
  const htmlName = "index" + min + ".html";
  const jsName = package + min + ".js";
  const cssName = package + min + ".css";
  const vendors = Object.keys(externalLibs).map((s) => s + min + ".js");
  const favIconData = JSON.parse(fs.readFileSync(favIconDataFile)).favicon;

  let stream = gulp
    .src(htmlEntries)
    .pipe(injectHtmlDep(favIconData.html_code))
    .pipe(injectHtmlDep(cssName))
    .pipe(injectHtmlDep(vendors))
    .pipe(injectHtmlDep(jsName));

  if (debug) {
    stream = stream.pipe(plugins.prettyHtml({ indent_inner_html: true }));
  } else {
    stream = stream.pipe(plugins.htmlmin({ collapseWhitespace: true }));
  }
  if (process.env.watching === "watching") {
    stream = stream.pipe(plugins.connect.reload());
    if (!watchStreams["html"]) {
      watchStreams["html"] = gulp.watch(htmlEntries, html);
    }
  }

  return stream.pipe(plugins.rename(htmlName)).pipe(gulp.dest(outDir));
}

function css() {
  const debug = process.env.NODE_ENV !== "production";
  const cssName = package + (debug ? ".css" : ".min.css");

  let stream = gulp
    .src(cssEntries)
    .pipe(
      plugins.sass(sass)({
        outputStyle: debug ? "expanded" : "compressed",
        outFile: cssName,
      }),
    )
    .pipe(plugins.concat("style.css"))
    .pipe(plugins.rename(cssName));

  if (debug) {
    stream = stream
      .pipe(plugins.sourcemaps.init({ loadMaps: debug }))
      .pipe(plugins.sourcemaps.write("./"));
  } else {
    stream = stream.pipe(plugins.cleanCss());
  }
  if (process.env.watching === "watching") {
    stream = stream.pipe(plugins.connect.reload());
    if (!watchStreams["sass"]) {
      watchStreams["sass"] = gulp.watch(cssEntries, css);
    }
  }

  return stream.pipe(gulp.dest(outDir));
}

function vendor() {
  return Object.entries(externalLibs).map(([fileName, libraries]) => {
    const vendorFile = () => {
      const debug = process.env.NODE_ENV !== "production";
      const outputName = fileName + (debug ? ".js" : ".min.js");
      let bundler = browserify({ basedir: ".", debug });
      libraries.forEach((lib) => bundler.require(lib));

      if (!debug) {
        bundler = bundler
          .transform(envify({ _: "purge", NODE_ENV: process.env.NODE_ENV }), {
            global: true,
          })
          .transform(uglifyify, { global: true, sourceMap: debug });
      }

      let stream = bundler.bundle().pipe(source(outputName)).pipe(buffer());

      if (debug) {
        stream = stream
          .pipe(plugins.sourcemaps.init({ loadMaps: debug }))
          .pipe(plugins.sourcemaps.write("./"));
      } else {
        stream = stream.pipe(
          plugins.terser({
            compress: !debug,
            mangle: !debug,
            sourceMap: debug,
          }),
        );
      }

      return stream.pipe(gulp.dest(outDir));
    };

    Object.assign(vendorFile, {
      displayName: "vendor-" + fileName,
    });
    return vendorFile;
  });
}

function ts() {
  const debug = process.env.NODE_ENV !== "production";
  const bundleName = package + (debug ? ".js" : ".min.js");

  let bundler = watchStreams["ts"];
  if (!bundler) {
    bundler = browserify({
      basedir: ".",
      entries: jsEntries,
      debug,
      extensions,
    })
      .external(Object.values(externalLibs).flat())
      .plugin(tsify, {
        target: "ES6",
        module: "ESNext",
        lib: ["DOM", "ESNext", "ScriptHost"],
        allowSyntheticDefaultImports: true,
      })
      .transform(
        babelify.configure({
          presets: ["@babel/preset-env", "@babel/preset-react"],
          extensions,
        }),
      );

    if (!debug) {
      bundler = bundler
        .transform(envify({ _: "purge", NODE_ENV: process.env.NODE_ENV }), {
          global: true,
        })
        .transform(uglifyify, { global: true, sourceMap: debug });
    }

    if (process.env.watching === "watching") {
      bundler = watchify(bundler)
        .on("update", ts)
        .on("log", log)
        .on("error", log.error);
      watchStreams["ts"] = bundler;
    }
  }

  let stream = bundler.bundle().pipe(source(bundleName)).pipe(buffer());

  if (debug) {
    stream = stream
      .pipe(plugins.sourcemaps.init({ loadMaps: true }))
      .pipe(plugins.sourcemaps.write("./"));
  } else {
    stream = stream.pipe(
      plugins.terser({ compress: !debug, mangle: !debug, sourceMap: debug }),
    );
  }
  if (process.env.watching === "watching") {
    stream = stream.pipe(plugins.connect.reload());
  }

  return stream.pipe(gulp.dest(outDir));
}

function server(done) {
  plugins.connect.server({
    name: package,
    root: outDir,
    port: 8080,
    livereload: true,
    middleware: function () {
      return [
        function (req, res, next) {
          if (/_kill_\/?/.test(req.url)) {
            watchStreams.values().forEach((stream) => stream.close());
            watchStreams = {};
            plugins.connect.serverClose();
            res.end();
            done();
          }
          next();
        },
      ];
    },
  });
}

function generateFavicon(done) {
  plugins.realFavicon.generateFavicon(
    {
      masterPicture: favIconsDir + "/" + favIconMasterPicture,
      dest: favIconsDir,
      iconsPath: favIconsDir + "/",
      design: {
        ios: {
          pictureAspect: "backgroundAndMargin",
          backgroundColor: "#ffffff",
          margin: "14%",
          assets: {
            ios6AndPriorIcons: false,
            ios7AndLaterIcons: false,
            precomposedIcons: false,
            declareOnlyDefaultIcon: true,
          },
        },
        desktopBrowser: {
          design: "raw",
        },
        windows: {
          pictureAspect: "noChange",
          backgroundColor: "#da532c",
          onConflict: "override",
          assets: {
            windows80Ie10Tile: false,
            windows10Ie11EdgeTiles: {
              small: false,
              medium: true,
              big: false,
              rectangle: false,
            },
          },
        },
        androidChrome: {
          pictureAspect: "noChange",
          themeColor: "#ffffff",
          manifest: {
            display: "standalone",
            orientation: "notSet",
            onConflict: "override",
            declared: true,
          },
          assets: {
            legacyIcon: false,
            lowResolutionIcons: false,
          },
        },
        safariPinnedTab: {
          pictureAspect: "silhouette",
          themeColor: "#990000",
        },
      },
      settings: {
        scalingAlgorithm: "Mitchell",
        errorOnImageTooSmall: false,
        readmeFile: false,
        htmlCodeFile: false,
        usePathAsIs: false,
      },
      markupFile: favIconDataFile,
    },
    function () {
      done();
    },
  );
}

function favicon(done) {
  var currentVersion = JSON.parse(fs.readFileSync(favIconDataFile)).version;
  plugins.realFavicon.checkForUpdates(currentVersion, function (err) {
    if (err) {
      return generateFavicon(done);
    }
    done();
  });
}

function copyDist() {
  const debug = process.env.NODE_ENV !== "production";
  const min = debug ? "" : ".min";
  const htmlName = "index" + min + ".html";
  const jsName = package + min + ".js";
  const cssName = package + min + ".css";
  const vendors = Object.keys(externalLibs).map((s) => s + min + ".js");

  return gulp
    .src(
      [htmlName, jsName, cssName]
        .concat(vendors)
        .concat(assetEntries)
        .map((f) => outDir + "/" + f),
    )
    .pipe(
      plugins.rename((path) => {
        if (path.basename == "index.min") {
          path.basename = "index";
        }
      }),
    )
    .pipe(gulp.dest(githubPagesDir + "/" + package));
}

const compile = gulp.parallel(assets, html, css, ts, vendor());
exports.release = gulp.series(setEnv(false), favicon, compile);
exports.debug = gulp.series(setEnv(true), favicon, compile);
exports.start = gulp.series(setEnv(true, true), favicon, compile, server);
exports.githubRelease = gulp.series(exports.release, copyDist);
exports.generateFavicon = gulp.series(setEnv(false), generateFavicon, favicon);
