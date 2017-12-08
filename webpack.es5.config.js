var webpack = require("webpack");
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');

var config = {
  entry: {
    "jet" : "./sources/es5.ts"
  },
  output: {
    path: path.join(__dirname, 'codebase'),
    publicPath:"/codebase/",
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ["./sources", "./node_modules"]
  },
  plugins: [
    new LiveReloadPlugin(),
    new webpack.IgnorePlugin(/^jet-views/, /^jet-locales/)
  ]
};

module.exports = config;