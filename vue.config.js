const path = require('path');
const arp = require('app-root-path');
const jsConfigPathsPlugin = require('jsconfig-paths-webpack-plugin');

module.exports = {
    configureWebpack: (config) => {
        config.devtool = 'source-map';
        config.resolve.plugins.push(new jsConfigPathsPlugin());

        // Aliasing for templates
        config.resolve.alias.client = path.resolve(arp.path, "src", "client");
        config.resolve.alias["~client"] = path.resolve(arp.path, "src", "client");
    },
    chainWebpack: config => {
        // If you wish to remove the standard entry point
        config.entryPoints.delete('app');

        // then add your own
        config.entry('admin')
            .add('./src/client/admin.js')
            .end()
            .entry('public')
            .add('./src/client/public.js')
            .end();
    }
};
