module.exports = {
  'extends': [
    'google',
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "unused-imports",
  ],
  "env": { "node": true, "es6": true },
  "parserOptions": {
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  rules: {
    'indent': 0,
    'new-cap': 0,
    'require-jsdoc': 0,
    'prefer-const': 0,
    'no-invalid-this': 0,
    'no-trailing-spaces': 0,
    'max-len': 0,
    'brace-style': ["error", "stroustrup", { "allowSingleLine": true }],
    "no-unused-vars": 0,
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": ["warn", { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }],
  },
};
