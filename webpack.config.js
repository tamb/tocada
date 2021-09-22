const path = require('path');
const webpack = require('webpack');

module.exports = {
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }, 
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9000,
    open: true
  },
  plugins: [
    new webpack.ProgressPlugin({ percentBy: "entries" })
  ]
};
