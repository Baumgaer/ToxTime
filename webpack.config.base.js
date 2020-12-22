/* eslint-disable */
const os = require('os');
const path = require('path');
const arp = require('app-root-path');

const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');
const jsConfigPathsPlugin = require('jsconfig-paths-webpack-plugin');

module.exports = (_env, options, returnConfigObject) => {

    console.log("operating in mode", options.mode);

    ///////////////////////////////////
    // PROVIDE UTILS

    const isDevelopment = Boolean(options.mode === "development");

    const cacheLoaderSettings = (cacheName) => {
        return {
            loader: 'cache-loader',
            options: {
                cacheDirectory: path.resolve(arp.path, options.cacheDir, cacheName)
            }
        };
    };

    const threadLoaderSettings = () => {
        return {
            loader: 'thread-loader',
            options: {
                // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                workers: Math.max(Math.floor((os.cpus().length) / 2), 1),
                poolRespawn: false,
                poolTimeout: options.watch ? Infinity : 1000 // set this to Infinity in watch mode - see https://github.com/webpack-contrib/thread-loader
            }
        };
    };

    ///////////////////////////////////
    // CONFIGURE BUILD

    const settings = {
        output: {
            filename: "[name].js"
        },
        context: path.resolve(arp.path, "out"),
        devtool: isDevelopment ? 'inline-source-map' : 'source-map', // use cheap-eval-source-map when sourcemaps are broken
        plugins: [
            new webpack.ExtendedAPIPlugin(),
            // new webpack.DefinePlugin({
            //     ENVIRONMENTAL_ROUTES_PATH: JSON.stringify(path.resolve(arp.path, options.scriptDir, "routes")),
            //     ENVIRONMENTAL_MODELS_PATH: JSON.stringify(path.resolve(arp.path, options.scriptDir, "models")),
            //     ENVIRONMENTAL_INTERFACES_PATH: JSON.stringify(path.resolve(arp.path, options.scriptDir, "interfaces"))
            // })
        ],
        resolve: {
            plugins: [
                new jsConfigPathsPlugin()
            ]
        },
        module: {
            rules: [{
                test: /\.js?$/,
                use: [cacheLoaderSettings("serverJS"), threadLoaderSettings(), {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            "@babel/plugin-proposal-nullish-coalescing-operator",
                            "@babel/plugin-proposal-optional-chaining"
                        ],
                        sourceMap: 'inline'
                    }
                }]
            }]
        },
        optimization: {
            noEmitOnErrors: true,
            removeAvailableModules: !isDevelopment,
            removeEmptyChunks: !isDevelopment,
            minimize: !isDevelopment,
            minimizer: [new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    compress: true,
                    keep_classnames: false,
                    keep_fnames: true,
                    sourceMap: false,
                    output: {
                        ecma: 2015,
                        comments: false,
                        beautify: false,
                        quote_style: 3
                    }
                }
            })]
        }
    };

    ///////////////////////////////////
    // EXTEND BUILD PLUGINS

    ///////////////////////////////////
    // EXTEND OPTIMIZATION OPTIONS
    if (!isDevelopment) {
        settings.optimization.splitChunks = {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        };
    }

    ///////////////////////////////////
    // EXTEND WATCH OPTIONS
    if (options.watch) settings.watchOptions = { ignored: ["node_modules", "var/**/*"] };

    const webpackConfigObject = { settings, cacheLoaderSettings, threadLoaderSettings };
    return returnConfigObject ? webpackConfigObject : settings;

};
