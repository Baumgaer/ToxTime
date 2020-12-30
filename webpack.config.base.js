/* eslint-disable */
const os = require('os');
const path = require('path');
const arp = require('app-root-path');

const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

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
        context: path.resolve(arp.path),
        devtool: isDevelopment ? 'inline-source-map' : 'source-map', // use cheap-eval-source-map when sourcemaps are broken
        plugins: [
            new webpack.ExtendedAPIPlugin(),
            new ForkTsCheckerWebpackPlugin({
                async: true,
                typescript: {
                    enabled: true,
                    configFile: path.resolve(arp.path, options.tsConfigPath),
                    diagnosticOptions: {
                        syntactic: true
                    },
                    profile: true
                }
            })
        ],
        resolve: {
            extensions: [".js", ".njk", ".less"],
            alias: {
                //less path resolve. "~" is replaced by less-loader
                "~server": path.resolve(arp.path, "src", "server"),
                "~common": path.resolve(arp.path, "src", "common")
            },
            // Add `.ts` and `.tsx` as a resolvable extension.
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: path.resolve(arp.path, options.tsConfigPath),
                    extensions: [".js"]
                })
            ]
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: [cacheLoaderSettings("typescript"), threadLoaderSettings(), {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            "@babel/plugin-proposal-nullish-coalescing-operator",
                            "@babel/plugin-proposal-optional-chaining"
                        ],
                        sourceMap: 'inline'
                    }
                }, {
                    loader: 'ts-loader',
                    options: {
                        happyPackMode: true, // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
                        transpileOnly: true,
                        experimentalWatchApi: options.watch === true,
                        allowTsInNodeModules: false
                    }
                }]
            }, {
                test: /\.(njk|nunjucks)$/,
                use: [cacheLoaderSettings("templates"), threadLoaderSettings(), {
                    loader: 'renewed-nunjucks-loader',
                    options: {
                        sourceMap: 'inline',
                        config: path.resolve(arp.path, "nunjucks.config.js"),
                        quiet: true
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
