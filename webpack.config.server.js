/* eslint-disable */
const arp = require('app-root-path');
const path = require('path');
const lodash = require("lodash");

const nodeExternals = require('webpack-node-externals');

const webpackConfigBase = require("./webpack.config.base");

module.exports = (env, options, returnConfigObject) => {

    ///////////////////////////////////
    // CONFIGURE ENVIRONMENT

    const inherited = Object.assign({}, options);
    Object.assign(options, {
        cacheDir: "./var/buildcache/backend",
        scriptDir: "./src/server"
    }, inherited);

    ///////////////////////////////////
    // LOAD BASE

    const webpackConfigObject = webpackConfigBase(env, options, true);

    ///////////////////////////////////
    // CONFIGURE BUILD

    const settings = lodash.merge(webpackConfigObject.settings, {
        target: "node",
        entry: {
            server: path.resolve(arp.path, "src", "server", "main.js")
        },
        output: {
            path: path.resolve(arp.path)
        },
        node: {
            // Need this when working with express, otherwise the build fails
            __dirname: false,   // if you don't put this is, __dirname
            __filename: false,  // and __filename return blank or /
        },
        externals: [nodeExternals()], // Need this to avoid error when working with Express
        optimization: {
            splitChunks: false
        }
    });

    settings.output.libraryTarget = "commonjs";

    ///////////////////////////////////
    // EXTEND BUILD PLUGINS
    // @ts-ignore
    settings.plugins = settings.plugins.concat([]);

    ///////////////////////////////////
    // EXTENDS BUILD MODULE RULES

    settings.module.rules = settings.module.rules.concat([]);

    return returnConfigObject ? webpackConfigObject : settings;
};
