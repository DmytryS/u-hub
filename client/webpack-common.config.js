/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin(),
    new Dotenv({
      safe: false,
      silent: false,
      path: path.resolve(__dirname, './.env'),
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname,
        postcss: [],
      },
    }),
    new HappyPack({
      id: 'jsHappy',
      loaders: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      ],
    }),
    new HappyPack({
      id: 'scssHappy',
      loaders: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]',
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            parser: 'postcss-scss',
            plugins() {
              return [precss, autoprefixer];
            },
          },
        },
        'sass-loader',
      ],
    }),
    new HappyPack({
      id: 'cssHappy',
      loaders: [
        {
          loader: 'css-loader',
          // options: {
          //   importLoaders: 1,
          //   localIdentName: "[name]__[local]___[hash:base64:5]"
          // }
        },
        {
          loader: 'postcss-loader',
          options: {
            parser: 'postcss-scss',
            plugins() {
              return [precss, autoprefixer];
            },
          },
        },
        'sass-loader',
      ],
    }),
  ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.mjs', '.flow'],
    alias: {
      // "../../theme.config$": path.join(__dirname, "/stylesheets/theme.config"),
      // "../stylesheets/site": path.join(__dirname, "/stylesheets/site"),
      '../stylesheets': path.join(__dirname, '/stylesheets'),
      '../fonts': path.join(__dirname, '/fonts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'url-loader',
        query: 'name=images/[name].[ext]&limit=4000',
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: 'file-loader',
        query: 'name=fonts/[name].[ext]',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        query: 'name=templates/[name].[ext]',
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
      },
      {
        test: /\.(js|jsx|flow)$/,
        loader: 'happypack/loader?id=jsHappy',
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.(mjs|flow)$/,
        loader: 'happypack/loader?id=jsHappy',
        include: path.join(__dirname, 'node_modules'),
        type: 'javascript/auto',
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'happypack/loader?id=scssHappy'],
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'happypack/loader?id=cssHappy'],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          enforce: true,
          name: 'vendors',
        },
      },
      chunks: 'all',
    },
  },
};
