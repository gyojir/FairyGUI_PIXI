//  Imports

//  Exports
module.exports = function(api) {
  //  Cache   =====================================
  api.cache(() => process.env.NODE_ENV === 'production');

  //  Presets =====================================
  const env = [
    '@babel/preset-env', 
    {
      'targets': {
        'node': 'current',
      },
    },
  ];

  const typescript = ['@babel/preset-typescript'];

  //  Plugins =====================================

  //  Return =====================================
  const presets = [typescript, env];
  const plugins = [];
  return {presets, plugins};
};
