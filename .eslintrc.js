module.exports = {
  'extends': [
    'google',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'plugins': [
    '@typescript-eslint',
    'unused-imports',
  ],
  'env': { 'node': true, 'es6': true },
  'parserOptions': {
    'sourceType': 'module',
    'project': './tsconfig.json'
  },
  'ignorePatterns': [
    '*.js',
    'tools/*',
    'dist/*',
  ],
  'rules': {
    'indent': 0,
    'new-cap': 0,
    'require-jsdoc': 0,
    'prefer-const': 0,
    'no-invalid-this': 0,
    'no-trailing-spaces': 0,
    'no-unused-vars': 0,
    'no-multi-spaces': 0,
    'no-unused-expressions': ['error', { 'allowTernary': true }],
    'max-len': 0,
    'brace-style': ['error', 'stroustrup', { 'allowSingleLine': true }],
    'linebreak-style': ['error', 'windows'],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unused-expressions': ['error', { 'allowTernary': true }],
  },
  // control vscode error
  'overrides': [
    {
      'files': ['.eslintrc.js', 'tools/*.js'],
      'parserOptions': {}
    }
  ]
};
