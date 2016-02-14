const webpack = require('webpack');
const debug = process.env.NODE_ENV !== 'production';

module.exports = {

  devtool: debug ? 'inline-sourcemap' : null,
  entry: './index.js',
  output: {
    path: 'build',
    filename: 'bundle.js',
    publicPath: '/build/',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
    ],
  },

  plugins: debug ? [] : [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],

};
