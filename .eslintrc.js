module.exports = {
  extends: ['eslint:recommended'],

  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true
    }
  },

  env: {
    node: true
  },

  ignorePatterns: ['node_modules/']
};
