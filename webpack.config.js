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
    performance: { maxEntrypointSize: 4194304, maxAssetSize: 1048576 },

    entry: {
      main: {
        filename: "index" + min + ".html",
        import: "src/index.pug",
      },
    },

    output: {
      // clean: true,
      filename: "[name]" + min + ".js",
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
      ],
    },

    optimization: {
      minimize: !debug,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          node_modules: {
            test: /[\\/]node_modules[\\/]/i,
            filename: "vendors" + min + ".js",
          },
          tabler_icons: {
            test: /[\\/]src[\\/].*tabler-sprite/i,
            filename: "tabler-icons" + min + ".js",
          },
          code: {
            test: /[\\/]src[\\/].*(ts|tsx|js|jsx|json)/i,
            filename: Package.name + min + ".js",
          },
        },
      },
    },

    plugins: [
      new PugPlugin({
        pretty: debug,
        modules: [
          PugPlugin.extractCss({ filename: Package.name + min + ".css" }),
        ],
      }),
      new CopyPlugin({ patterns: [{ from: "assets" }] }),
    ],

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
