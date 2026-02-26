/**
 * Webpack config: Node.js "node:"-prefixed built-ins are not handled by default.
 * - Polyfills (buffer, stream, crypto, path, zlib, url, util, process): full API in browser.
 * - Stubs (fs, http, https, net, stream/web): empty object; only satisfy the bundler.
 *   Dependencies (e.g. ipfs-http-client) pull in Node-only code paths; in browser the app
 *   uses fetch for IPFS gateway, so those paths are not executed. After major dependency
 *   updates, you can try removing stubs from nodeReplacements if build still succeeds.
 */
const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const emptyStub = path.join(__dirname, "src", "stubs", "empty.js");

const nodeReplacements = [
  ["node:buffer", require.resolve("buffer/")],
  ["node:stream", require.resolve("stream-browserify")],
  ["node:crypto", require.resolve("crypto-browserify")],
  ["node:path", require.resolve("path-browserify")],
  ["node:zlib", require.resolve("browserify-zlib")],
  ["node:url", require.resolve("url/")],
  ["node:util", require.resolve("util/")],
  ["node:fs", emptyStub],
  ["node:http", emptyStub],
  ["node:https", emptyStub],
  ["node:net", emptyStub],
  ["node:process", require.resolve("process/browser.js")],
  ["node:stream/web", emptyStub],
];

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "",
  configureWebpack: {
    resolve: {
      fallback: {
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        path: require.resolve("path-browserify"),
        zlib: require.resolve("browserify-zlib"),
        assert: require.resolve("assert/"),
        worker_threads: false,
        fs: false,
        http: false,
        https: false,
        net: false,
        url: require.resolve("url/"),
        util: require.resolve("util/"),
        process: require.resolve("process/browser.js"),
      },
    },
    plugins: [
      ...nodeReplacements.map(([request, replacement]) =>
        new webpack.NormalModuleReplacementPlugin(
          new RegExp("^" + request.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"),
          replacement
        )
      ),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, "node_modules/robonomics-ui-vue/assets"),
            to: "assets",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "node_modules/robonomics-ui-vue/assets"),
      publicPath: "/assets",
    },
  },
});
