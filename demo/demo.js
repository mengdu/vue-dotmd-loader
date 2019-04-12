const webpack = require('webpack')
const path = require('path')

const compiler = webpack({
  mode: 'development',
  entry: path.resolve(__dirname, 'test.md'),
  output: {
    path: path.resolve(__dirname),
    filename: 'dist/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: {
          loader: path.resolve(__dirname, '../dist/index.js'),
          options: {
            msg: 'Hello!'
          }
        }
      }
    ]
  }
})

compiler.run(function (err, stats) {
  if (err) {
    console.error(err)
    return false
  } else {
    console.log(stats.toJson().modules[0].source)
  }
})
