module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'standard',
  env: {
    browser: true,
    node: true,
    commonjs: true,
    jest: true
  },
  rules: {
    'no-unused-vars': 'warn'
  }
}
