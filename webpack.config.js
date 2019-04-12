'use strict'
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './examples/index.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'index.js',
    // libraryTarget: 'umd',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: process.env.NODE_ENV || '"development"'
      }
    }),
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    // new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ],
  devServer: {
    clientLogLevel: 'warning',
    contentBase: false,
    port: 8081,
    open: true,
    publicPath: '/',
    hot: true,
    inline: true
  }
}
