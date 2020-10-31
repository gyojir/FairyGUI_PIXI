//  Imports
const {resolve} = require('path');
const {ProgressPlugin} = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

//  Path
const {mapObjIndexed, call} = require('ramda');
const {
  getSourceDir: sourceDir,
  getProductDir: productDir,
  getPublicPath: publicPath,
  getBaseDir: baseDir,
  getToolDir: toolDir,
} = mapObjIndexed(call)(require('../constant'));

//  Exports
module.exports = function(...args) {
  return {
    //  Entry   ===========================================
    entry: resolve(sourceDir, 'index.ts'),
    resolve: {
      extensions: [".js", ".json", ".ts"],
    },

    //  Output  ===========================================
    output: {
      path: productDir,
      filename: 'fairyGUI_PIXI.js',
      publicPath: publicPath,
      library: 'fairyGUI_PIXI',
      libraryTarget: 'umd',
    },

    //  Module =============================================
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: [
            sourceDir,
          ],
          sideEffects: false,
          use: [
            {
              loader: 'babel-loader',
              options: {configFile: resolve(toolDir, 'babel.config.js')},
            },
          ],
        },
        {
          test: /\.(ico)$/,
          use: [
            {loader: 'url-loader', options: {limit: 8192}},
          ],
        },
      ],
    },

    //  Plugins ==========================================
    plugins: [
      new ProgressPlugin(),

      new HtmlWebpackPlugin({
        filename: 'index.html',
        favicon: resolve(baseDir, 'favicon.ico'),
        template: resolve(baseDir, 'index.html'),
        hash: true,
      }),
    ],
    //  END ============================================
  };
};
