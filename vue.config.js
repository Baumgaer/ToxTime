const path = require('path');
const arp = require('app-root-path');
const jsConfigPathsPlugin = require('jsconfig-paths-webpack-plugin');

module.exports = {
    configureWebpack: (config) => {
        config.devtool = 'source-map';
        config.resolve.plugins.push(new jsConfigPathsPlugin());

        // Aliasing for templates
        config.resolve.alias.client = path.resolve(arp.path, "src", "client");
    }
};
