const yaml = require("yaml");
const fs = require("graceful-fs");
const arp = require("app-root-path");
const path = require("path");
const crypto = require("crypto");

const defaults = {
    /**
     * The name of the application. Will be used to identify the application in
     * the process manager and will be displayed in the web application.
     */
    "APP_NAME": "PACMaker",

    /**
     * The domain on which the application is reachable. This should contain a
     * port if no reverse proxy or default HTTP/S port is used.
     */
    "APP_DOMAIN": "localhost",

    /**
     * Enables or disables HTTPS.
     */
    "APP_SECURE": true,


    /**
     * The IP address on which the application will accept requests.
     * Use 0.0.0.0 to accept requests on all IP addresses.
     */
    "APP_HOST": "localhost",

    /**
     * The HTTP port on which the application will accept requests
     */
    "APP_HTTP_PORT": 80,

    /**
     * The HTTPS port on which the application will accept requests
     */
    "APP_HTTPS_PORT": 443,

    /**
     * If there is a reverse proxy in front of this application, for example nginx,
     * this will enable the application to react on requests of this proxy.
     *
     * possible values:
     *      boolean: will use the most right entry of header X-Forwarded-* as IP or disable the behavior
     *      IP addresses: will define a subnet. use comma to separate for several values e.g. loopback, 123.123.123.123
     *          loopback - 127.0.0.1/8, ::1/128,
     *          linklocal - 169.254.0.0/16, fe80::/10,
     *          uniquelocal - 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
     *          any other IP address
     *      number: The nth hop from the proxy server should be trusted as a client.
     */
    "APP_TRUST_PROXY": false,


    /**
     * The IP address of the database server
     */
    "DB_HOST": "localhost",

    /**
     * The port of the database server
     */
    "DB_PORT": 27017,

    /**
     * The name of the database which will be created automatically
     */
    "DB_DATABASE_NAME": "PACMakerDB",

    /**
     * The database login name
     */
    "DB_USER": "",

    /**
     * The database login password
     */
    "DB_USER_PASSWORD": "",


    /**
     * The secret to secure the session token. Will be randomly generated on
     * each server restart by default.
     */
    "SESSION_SECRET": crypto.randomBytes(512).toString(),

    /**
     * Maximum timeout of the session in human readable value e.g. 1h for one
     * hour or 1m for one minute or 2.5 hrs for two and a half day.
     * Notice the space between 2.5 and hrs.
     */
    "SESSION_MAX_AGE": "1h",


    /**
     * The name which will be displayed as an email sender
     */
    "MAIL_NAME": "PACMaker",

    /**
     * The email address which will be used as an email sender
     */
    "MAIL_ADDRESS": "noreply@pacmaker.com",

    /**
     * The IP address of the mail server
     */
    "MAIL_HOST": "",

    /**
     * The port of the mail server
     */
    "MAIL_PORT": 465,

    /**
     * Will enable od disable TLS for sending emails
     */
    "MAIL_TLS": true,

    /**
     * The login user name of the mail server
     */
    "MAIL_USER": "",

    /**
     * The login password of the mail server
     */
    "MAIL_PASSWORD": "",

    // Static config
    "PATH_STATIC_FILES": path.resolve(arp.path, "dist")
};

const configString = fs.readFileSync(path.resolve(arp.path, "config.yaml")).toString();
const parsedConfig = yaml.parse(configString);
const config = Object.assign(defaults, parsedConfig);

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
        "error_file": path.resolve(arp.path, "var", "log", "error.log"),
        "pid_file": path.resolve(arp.path, "var", "pid", "process.pid"),

        watch: shouldWatch ? ["./src/server", "./src/common"] : false,
        "restart_delay": 2000,
        "max_restarts": 6,

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
