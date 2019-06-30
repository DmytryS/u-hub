/* eslint-disable import/no-extraneous-dependencies */
const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const webpackCommon = require("./webpack-common.config");

module.exports = webpackMerge(webpackCommon, {
  mode: "development",
  entry: ["babel-polyfill", "./src/App.jsx"],
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "./build/client"),
    filename: "scripts/[name].[hash].js",
    chunkFilename: "scripts/[name].[contenthash].js"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      // template: "./src/entry/main.hbs",
      filename: "index.html",
      chunks: ["main", "vendors"],
      inject: "body"
    })
  ],

  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    // https: true,
    port: 3000,
    proxy: {
      "/bapi/**": {
        target: "https://development.legatics.com",
        secure: false,
        changeOrigin: true
      }
    },
    hot: true,
    stats: "minimal",
    clientLogLevel: "info",
    overlay: true,
    compress: true,
    inline: true,
    historyApiFallback: true
  }
});
