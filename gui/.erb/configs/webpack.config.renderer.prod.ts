/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import deleteSourceMaps from '../scripts/delete-source-maps';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

checkNodeEnv('production');
deleteSourceMaps();

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
      devtool: 'source-map'
    }
    : {};

const configuration: webpack.Configuration = {
  ...devtoolsConfig,

  mode: 'production',

  target: ['web', 'electron-renderer'],

  entry: [path.join(webpackPaths.srcRendererPath, 'index.tsx')],

  output: {
    path: webpackPaths.distRendererPath,
    publicPath: './',
    filename: 'renderer.js',
    library: {
      type: 'umd'
    },
    assetModuleFilename: 'assets/[name][ext][query]'
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        include: [webpackPaths.srcRendererPath],
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true
      }),
      new CssMinimizerPlugin()
    ]
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled'
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(webpackPaths.rootPath, 'assets'), // 从项目根目录下的assets目录拷贝
          to: path.resolve(webpackPaths.distRendererPath, 'assets') // 拷贝到输出目录的dist/renderer/assets下
        }
      ]
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      },
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV !== 'production'
    }),

    new CopyPlugin({
      patterns: [
        // ...
        {
          from: 'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js',
          to: '[name][ext]'
        },
        {
          from: 'node_modules/@ricky0123/vad-web/dist/*.onnx',
          to: '[name][ext]'
        },
        { from: 'node_modules/onnxruntime-web/dist/*.wasm', to: '[name][ext]' }
      ]
    })

  ]
};

export default merge(baseConfig, configuration);
