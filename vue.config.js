module.exports = {
  publicPath: "",
  transpileDependencies: ["@polkadot"],
  parallel: false,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: require.resolve("@open-wc/webpack-import-meta-loader")
        }
      ]
    }
  }
};
