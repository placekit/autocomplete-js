module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    'google'
  ],
  ignorePatterns: ['*.test.js'],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    'indent': ['error', 2, {
      'SwitchCase': 1,
      'FunctionDeclaration': {
        'parameters': 'first',
      }
    }],
    'max-len': ['error', {
      'code': 100,
      'ignoreComments': true,
      'ignoreTrailingComments': true,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true,
    }],
    'new-cap': 'off',
    'no-console': 'off',
    'no-throw-literal': 'off',
    'object-curly-spacing': ['error', 'always']
  }
};
