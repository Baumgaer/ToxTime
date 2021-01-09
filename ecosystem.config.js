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
     * @type {select}
     * @property {false} Disable will disable reverse proxy
     * @property {true} Enable will use the most right entry of header X-Forwarded-* as IP or disable the behavior
     * @property {"loopback"} Loopback 127.0.0.1/8, ::1/128
     * @property {"linklocal"} LinkLocal 169.254.0.0/16, fe80::/10
     * @property {"uniquelocal"} UniqueLocal 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
     * @property {1} Number The nth hop from the proxy server should be trusted as a client. Must be set manually in config.yaml
     * @property {""} Manual any other IP address or list of IP addresses. Must be set manually in config.yaml
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
     * The IP address of the mail server. If the host is not given in development
     * mode, the host of the temporary ether.mail account will be used and the
     * configured host else.
     */
    "MAIL_HOST": "",

    /**
     * The port of the mail server. When the port is 0 in development mode,
     * the port of the temporary ether.mail account will be used and the
     * configured port else.
     */
    "MAIL_PORT": 465,

    /**
     * Will enable or disable SSL for sending emails. In development mode,
     * this can set to null to let the testaccount decide wether it is true
     * or false. Otherwise the configured value is used. If it is false,
     * the mailer will try STARTTLS and if it does not work, it will use no
     * encryption.
     */
    "MAIL_SSL": true,

    /**
     * The login user name of the mail server. If empty, the test account user
     * name will be used in development mode. Otherwise the configured value
     * will be used.
     */
    "MAIL_USER": "",

    /**
     * The login password of the mail server.If empty, the test account user
     * password will be used in development mode. Otherwise the configured value
     * will be used.
     */
    "MAIL_PASSWORD": ""
};

const staticConfig = {
    "PATH_STATIC_FILES": path.resolve(arp.path, "dist"),
    "FRONTEND_EXPOSED_CONFIG": "'APP_NAME', 'APP_DOMAIN'"
};

const configString = fs.readFileSync(path.resolve(arp.path, "config.yaml")).toString();
const parsedConfig = yaml.parse(configString);
const config = Object.assign(defaults, parsedConfig, staticConfig);

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
