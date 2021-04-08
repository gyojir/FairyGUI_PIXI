//  Imports
const {resolve} = require('path');

//  Path
const {mapObjIndexed, call} = require('ramda');
const {
  getTestDir: testDir,
} = mapObjIndexed(call)(require('../constant'));

//  Exports
module.exports = function(...args) {
  return {
    //  Entry   ===========================================
    entry: resolve(testDir, 'main.ts'),

    //  Mode    =========================================
    mode: 'development',

    //  DevTool =========================================
    devtool: 'inline-source-map',

  };
};
