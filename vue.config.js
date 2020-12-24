const path = require('path');
const arp = require('app-root-path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin').TsconfigPathsPlugin;

module.exports = {
    configureWebpack: (config) => {
        config.devtool = 'source-map';
        config.resolve.plugins.push(new TsconfigPathsPlugin({
            configFile: path.resolve(arp.path, "tsconfig.json"),
            extensions: [".js"]
        }));

        // Aliasing for templates
        config.resolve.alias.client = path.resolve(arp.path, "src", "client");
        config.resolve.alias["~client"] = path.resolve(arp.path, "src", "client");
        config.resolve.alias["~common"] = path.resolve(arp.path, "src", "common");
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
