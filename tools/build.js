//  Imports
const {table, log} = console;
const {mergeRight} = require('ramda');

//  Exports
module.exports = function(env) {
  log('======Please Check Out Current Environment=========');
  table({
    'Node': process.env.NODE_ENV,
    'Webpack': env.mode,
  });
  log('===================================================');

  const commonConfig = require(`./common.config.js`)();

  const environmentConfig = require(`./${env.mode}.config.js`)();
  
  commonConfig.resolve.fallback = {
      "stream": require.resolve("stream-browserify"),
      "string_decoder": require.resolve("string_decoder/"),
      "buffer": require.resolve("buffer/") 
  };

  return mergeRight(commonConfig, environmentConfig);
};

