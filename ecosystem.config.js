const yaml = require("yaml");
const fs = require("graceful-fs");
const arp = require("app-root-path");
const path = require("path");
const crypto = require("crypto");

const configString = fs.readFileSync(path.resolve(arp.path, "config.yaml")).toString();
const parsedConfig = yaml.parse(configString);
const config = Object.assign({
    "APP_NAME": "PACMaker",

    "APP_HOST": "localhost",
    "APP_HTTP_PORT": 80,
    "APP_HTTPS_PORT": 443,

    "DB_HOST": "localhost",
    "DB_PORT": 27017,
    "DB_DATABASE_NAME": "PACMakerDB",
    "DB_USER": "",
    "DB_USER_PASSWORD": "",

    "SESSION_SECRET": crypto.randomBytes(512).toString(),
    "SESSION_MAX_AGE": "1h",

    "MAIL_NAME": "PACMaker",
    "MAIL_ADDRESS": "noreply@pacmaker.com",
    "MAIL_HOST": "",
    "MAIL_PORT": 465,
    "MAIL_TLS": true,
    "MAIL_USER": "",
    "MAIL_PASSWORD": "",

    // Static config
    "PATH_STATIC_FILES": path.resolve(arp.path, "dist")
}, parsedConfig);

let shouldWatch = false;

for (const [index, argv] of process.argv.entries()) {
    if (argv === "--env" && process.argv[index + 1] === "development") {
        shouldWatch = true;
        break;
    }
}

console.log(shouldWatch ? "Watching for changes" : "");

module.exports = {
    apps: [{
        name: config.APP_NAME || "PACMaker",
        script: path.resolve(arp.path, "server.js"),
        cwd: path.resolve(arp.path),

        "log_date_format": "YYYY-MM-DD HH:mm Z",
        "out_file": path.resolve(arp.path, "var", "log", "stdout.log"),
        "error_log": path.resolve(arp.path, "var", "log", "error.log"),
        "pid_file": path.resolve(arp.path, "var", "pid"),

        watch: shouldWatch ? ["/src/server", "/src/common"] : false,

        env: Object.assign({
            "NODE_ENV": config.NODE_ENV || "production",
            "DEBUG": config.DEBUG || false
        }, config),
        "env_development": Object.assign({
            "NODE_ENV": config.NODE_ENV || "development",
            "DEBUG": config.DEBUG !== undefined ? config.DEBUG : true
        }, config)
    }]
};
