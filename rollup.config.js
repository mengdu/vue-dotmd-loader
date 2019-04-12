const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const Eslint = require('rollup-plugin-eslint')
const babel = require('rollup-plugin-babel')
const Uglify = require('rollup-plugin-uglify')
const pkg = require('./package.json')

const banner =
  '/* eslint-disable */\n' +
  '/*!\n' +
  ' * Build version v' + pkg.version + '\n' +
  ' * Create by ' + pkg.author.email + '\n' +
  ' * Created at ' + new Date() + '\n' +
  ' */'

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  input: 'src/index.js',
  output: [
    {
      // window.$m
      name: '$myapp',
      file: isProduction ? 'dist/bundle.min.js' : 'dist/bundle.js',
      format: 'umd',
      // banner: banner,
      sourcemap: false
    }
    // { file: 'dist/bundle.cjs.js', format: 'cjs' },
    // { file: 'dist/bundle.esm.js', format: 'esm' },
    // { file: 'dist/bundle.amd.js', format: 'amd' },
    // { file: 'dist/bundle.iife.js', format: 'iife', name: '$m' }
  ],
  plugins: [
    Eslint.eslint({
      exclude: ['node_modules/**']
    }),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    (isProduction && Uglify.uglify()),
    {
      name: 'banner',
      renderChunk (code) {
        return banner + '\n' + code
      }
    }
  ]
}
