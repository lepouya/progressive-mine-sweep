const CopyPlugin = require("copy-webpack-plugin");
const Package = require("./package.json");
const PugPlugin = require("pug-plugin");

module.exports = (env, argv) => {
  const debug = argv.mode !== "production" && !env.production;
  const min = debug ? "" : ".min";

  return {
    context: __dirname,
    mode: debug ? "development" : "production",
    devtool: debug ? "source-map" : undefined,
    resolve: { extensions: [".ts", ".tsx", ".js", ".scss"] },

    entry: {
      main: {
        filename: "index" + min + ".html",
        import: "src/index.pug",
      },
    },

    output: {
      // clean: true,
      filename: "[name]" + min + ".js",
      sourceMapFilename: "[file].map",
      path: __dirname + "/dist",
      publicPath: "",
    },

    module: {
      rules: [
        {
          test: /\.[tj]sx?$/i,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.s?[ca]ss$/i,
          use: ["css-loader", "sass-loader"],
        },
        {
          test: /\.pug$/,
          loader: PugPlugin.loader,
        },
      ],
    },

    plugins: [
      new PugPlugin({
        pretty: debug,
        modules: [
          PugPlugin.extractCss({
            filename: Package.name + min + ".css",
          }),
        ],
      }),
      new CopyPlugin({
        patterns: [{ from: "assets", to: "assets" }],
      }),
    ],

    optimization: {
      minimize: !debug,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          node_modules: {
            test: /[\\/]node_modules[\\/]/i,
            reuseExistingChunk: true,
            filename: "vendor" + min + ".js",
          },
          code: {
            test: /[\\/]src[\\/].*\.[tj]sx?/i,
            reuseExistingChunk: true,
            filename: Package.name + min + ".js",
          },
        },
      },
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
