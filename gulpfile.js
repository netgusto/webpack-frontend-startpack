'use strict';

var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require('webpack');
var objectAssign = require('object-assign');

var webpackConfigBase = {
    entry: [__dirname + '/src/main.js'],

    stats: {
      colors: true,
      reasons: true
    },

    resolve: {
      extensions: ['', '.js'],
      root: __dirname,
      alias: {
        'App': __dirname + '/src/scripts',
      },
      modulesDirectories: [
        __dirname + '/node_modules',
        __dirname + '/web_modules'
      ]
    },

    module: {
      preLoaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }],
      loaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?optional=runtime'
      }, {
        test: /\.scss/,
        loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded'
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }, {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      }]
    }
};

var webpackConfigDev = objectAssign({}, webpackConfigBase, {

  debug: true,
  cache: true,
  devtool: "eval-source-map",

  output: {
    //publicPath: __dirname + '/dist/',
    filename: 'dist.dev.js',
    path: 'dist/'
  },

  plugins: [
    //new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
});

var webpackConfigDist = objectAssign({}, webpackConfigBase, {

  debug: false,
  cache: false,
  devtool: false,

  output: {
    //publicPath: __dirname + '/dist/',
    filename: 'dist.min.js',
    path: 'dist/'
  },

  plugins: [
    //new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ]
});

var onBuild = function(done) {
    return function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            colors: true,
            children: false,
            chunks: false,
            modules: false
        }));
        if(done) { done(); }
    };
};

var build = function(done) { return webpack(webpackConfigDist).run(onBuild(done)); };
var watch = function(wpcfg, done) {
    webpack(wpcfg).watch(1000, function(err, stats) {
        onBuild()(err, stats);
    });
};

gulp.task('default', function(done) {
    build(done);
});

gulp.task('build', function(done) {
    build(done);
});

gulp.task('watch', function() {
    watch(webpackConfigDev);
});

gulp.task('watchdist', function() {
    watch(webpackConfigDist);
});
