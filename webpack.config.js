const path = require('path')
const SplitByPathPlugin = require('webpack-split-by-path');

module.exports = {
  entry: {
    app: './entry'
  },
  output: {
    path: path.resolve(__dirname, 'public/react'),
    filename: "[name].js",
    chunkFilename: "[name].js"
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  devtool: 'cheap-eval-source-map',
  debug: true,
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        loader : 'babel',
        //exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
    new SplitByPathPlugin([
      {
        name: 'vendor',
        path: path.join(__dirname, 'node_modules')
      }
    ], {
      manifest: 'app-entry'
    })
  ]
};
