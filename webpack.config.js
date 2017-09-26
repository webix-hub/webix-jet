var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');

var config = {
  entry: {
    "tests" : "./tests/suite.ts",
    "jet":'./jet.es5.ts'
  },
  output: {
    path: path.join(__dirname, 'codebase'),
    publicPath:"/codebase/",
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
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
    modules: ["./sources", "node_modules"],
    alias:{
      "jet-views":path.resolve(__dirname, 'sources/views'),
      "jet-locales":path.resolve(__dirname, 'sources/locales')
    }
  },
  plugins: [
    new LiveReloadPlugin()
  ]
};

module.exports = config;