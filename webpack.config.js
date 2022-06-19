const CopyPlugin = require("copy-webpack-plugin");
const PugPlugin = require("pug-plugin");
const package = require("./package.json");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const debug = argv.mode !== "production" && !env.production;
  const min = debug ? "" : ".min";

  return {
    context: __dirname,
    mode: debug ? "development" : "production",
    devtool: debug ? "source-map" : undefined,

    entry: {
      index: package.main,
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".scss"],
    },

    output: {
      assetModuleFilename: "[path][name][ext][query]",
      clean: env.clean ?? false,
      filename: (pd) =>
        pd.chunk.name.split(".").shift().replace("index", package.name) +
        min +
        ".js",
      path: __dirname + "/dist",
      publicPath: "",
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/i,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
        {
          test: /\.(css|scss|sass|less|styl)$/i,
          use: ["css-loader", "sass-loader"],
        },
        {
          test: /\.pug$/,
          use: [PugPlugin.loader],
        },
        {
          test: /\.svg$/i,
          type: "asset/source",
        },
        {
          test: /\.ttf$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },

    plugins: [
      new webpack.ProgressPlugin(),
      new CopyPlugin({ patterns: [{ from: "assets" }] }),
      new PugPlugin({
        pretty: debug,
        modules: [
          PugPlugin.extractCss({ filename: package.name + min + ".css" }),
        ],
      }),
    ],

    optimization: {
      minimize: !debug,
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        minSize: 131072,
        name: (m, _, key) =>
          key === "default" ? m.identifier().split(/[\\/]/).pop() : "vendors",
      },
    },

    performance: {
      maxEntrypointSize: 4194304,
      maxAssetSize: 1048576,
    },

    devServer: {
      static: { directory: __dirname + "/dist" },
      watchFiles: {
        paths: ["src/**/*.*"],
        options: { usePolling: true },
      },
      port: 8080,
      open: true,
    },
  };
};
