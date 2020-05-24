/* eslint-disable import/no-extraneous-dependencies */
const Dotenv = require('dotenv-webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { PORT } = process.env

module.exports = {
  mode: 'development',
  // watch: true,
  entry: path.resolve(__dirname, './src/App.jsx'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/react'],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new Dotenv({
      safe: false,
      silent: false,
      path: path.resolve(__dirname, './.env'),
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: 'body',
    }),
  ],

  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // https: true,
    host: '0.0.0.0',

    port: PORT || 3001,
    hot: true,
    stats: 'minimal',
    clientLogLevel: 'info',
    overlay: true,
    compress: true,
    inline: true,
    historyApiFallback: true,
    writeToDisk: false,
  },
}
