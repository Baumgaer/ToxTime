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
        config.optimization
            .minimizer('terser')
            .tap(args => {
                const { terserOptions } = args[0];
                terserOptions.keep_classnames = true;
                terserOptions.keep_fnames = true;
                return args;
            });
    },
    pages: {
        index: "src/client/Index.js",
        admin: "src/client/Admin.js",
        public: "src/client/Public.js"
    }
};
