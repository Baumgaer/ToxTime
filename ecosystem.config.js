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
     * port if _no_ reverse proxy or default HTTP/S port is used.
     */
    "APP_DOMAIN": "localhost",

    /**
     * A comma separated list of subdomains. Needed for HTTPS. NOTE: "www"
     * is also a subdomain!
     *
     * Example:
     * subdomain.yourdomain.com, basis.uni-bonn.de, ecampus.uni-bonn.de
     */
    "APP_ALT_NAMES": "",

    /**
     * Has to be a valid e-Mail address which is used for Let's Encrypt
     * certificates if HTTPS is enabled AND no reverse proxy is used.
     * It is also used as a contact for users in case of problems.
     */
    "APP_MAINTAINER_MAIL": "name@example.com",

    /**
     * The default language of the application. Will also be used to determine
     * the default language of users while registering new users. Doesn't have
     * any effect to automatic language detection but will be used as fallback
     * when a translation string is missing.
     *
     * @type {select}
     * @property {"de-de"} German de-de
     * @property {"en-us"} English en-us
     */
    "APP_DEFAULT_LANGUAGE": "de-de",

    /**
     * Enables or disables HTTPS. Needs a valid domain if no revers proxy will
     * be configured.
     */
    "APP_SECURE": true,

    /**
     * If there is a reverse proxy in front of this application, for example nginx,
     * this will enable the application to react on requests of this proxy.
     * If enabled, the app will use the HTTPS server of the reverse proxy
     * instead of creating an own HTTPS server.
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
     * The IP address on which the application will accept requests.
     * Use 0.0.0.0 to accept requests on all IP addresses.
     * Use localhost to accept requests only from same machine (recommended for
     * testing and in combination with reverse proxy).
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
     * The secret to secure the session token. Will be randomly generated on
     * each server restart by default (crypto.randomBytes(512).toString()).
     * Each other value will be static. This has nothing to do with user passwords.
     */
    "SESSION_SECRET": crypto.randomBytes(512).toString(),

    /**
     * Maximum timeout of the session in human readable value e.g. 1h for one
     * hour or 1m for one minute or 2.5 days for two and a half day.
     * Notice the space between 2.5 and day!
     */
    "SESSION_MAX_AGE": "1h",


    /**
     * The name of the field in the csv which describes the role (e.g. admin or tutor)
     */
    "ECAMPUS_MEMBER_CSV_ROLE_FIELD_NAME": "Rolle/Status",

    /**
     * The name of the field in the csv which holds the user name
     */
    "ECAMPUS_MEMBER_CSV_USER_NAME_FIELD_NAME": "Benutzername",

    /**
     * A comma separated list of values in the role field which will
     * determine wether or not to create an user as administrator.
     */
    "ECAMPUS_ADMIN_CONDITION": "Administrator",

    /**
     * A domain which will be used to extend the CSV field "userName" to an email
     * e.g. userName@ECAMPUS_USERNAME_EMAIL_DOMAIN
     */
    "ECAMPUS_USERNAME_EMAIL_DOMAIN": "uni-bonn.de",

    /**
     * Comma separated list of mappings <csv-field>:<database-field>.
     * If empty, no field will be mapped. the csv field name must be equal to
     * a field name in the ECAMPUS_MEMBER_CSV_FORMAT.
     *
     * e.g. name:lastName, firstName:nickname
     */
    "ECAMPUS_FIELD_MAPPING": "Benutzername:name",


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
     * The name which will be displayed as an email sender.
     * NOTE: Some e-mail provider do not allow to set a custom name. If sending
     * e-mails fails, keep this as an empty string (e.g.: "").
     *
     * A hint in the error log could be:
     * "Error: Mail command failed: 550-Requested action not taken: mailbox unavailable"
     */
    "MAIL_NAME": "PACMaker",

    /**
     * The email address which will be used as an email sender.
     * NOTE: Some e-mail provider do not allow custom e-mail address. If sending
     * e-mails fails, type the correct e-mail address the provider has given you.
     *
     * A hint in the error log could be:
     * "Error: Mail command failed: 550-Requested action not taken: mailbox unavailable"
     */
    "MAIL_ADDRESS": "noreply@pacmaker.com",

    /**
     * The IP address of the mail server (e.g.: smtp.email.com). If the host
     * is not given in development mode, the host of the temporary
     * http://ethereal.email/ account will be used and the configured host else.
     * While NOT in development mode, this has to be a valid host name.
     */
    "MAIL_HOST": "",

    /**
     * The port of the mail server. When the port is 0 in development mode,
     * the port of the temporary http://ethereal.email/ account will be used and the
     * configured port else.
     */
    "MAIL_PORT": 465,

    /**
     * Will enable or disable SSL for sending emails. In development mode,
     * this can set to null to let the testaccount decide wether it is true
     * or false. Otherwise the configured value is used. If it is false,
     * the mailer will try STARTTLS and if it does not work, it will use no
     * encryption. If it is set to true and the application is not able to send
     * e-mails, your e-mail provider possibly dies not support SSL.
     * In this case set it to false.
     *
     * A hint in the error log could be
     * "Error: 14904:error:1408F10B:SSL routines:ssl3_get_record:wrong version number"
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
    "FRONTEND_EXPOSED_CONFIG": "APP_NAME, APP_DOMAIN, APP_DEFAULT_LANGUAGE, ECAMPUS_MEMBER_CSV_ROLE_FIELD_NAME, ECAMPUS_MEMBER_CSV_USER_NAME_FIELD_NAME, ECAMPUS_ADMIN_CONDITION, ECAMPUS_USERNAME_EMAIL_DOMAIN, ECAMPUS_FIELD_MAPPING"
};

const configString = fs.readFileSync(path.resolve(arp.path, "config.yaml")).toString();
const parsedConfig = yaml.parse(configString);
const config = Object.assign(defaults, parsedConfig, staticConfig);

let shouldWatch = false;

for (const [index, argv] of process.argv.entries()) {
    if (argv === "--env" && process.argv[index + 1] === "development") {
        shouldWatch = true;
        config.NODE_ENV = "development";
        break;
    }
}

console.log(shouldWatch ? "Watching for changes" : "");

module.exports = {
    apps: [{
        name: config.APP_NAME || "PACMaker",
        script: path.resolve(arp.path, "server.js"),
        cwd: path.resolve(arp.path),
        "node_args": config.NODE_ENV === "development" ? ["--inspect=1992", "--trace-deprecation"] : [],

        "log_date_format": "YYYY-MM-DD HH:mm Z",
        "out_file": path.resolve(arp.path, "var", "log", "stdout.log"),
        "error_file": path.resolve(arp.path, "var", "log", "error.log"),
        "pid_file": path.resolve(arp.path, "var", "pid", "process.pid"),

        watch: shouldWatch ? ["./src/server", "./src/common"] : false,
        "watch_delay": 1500,
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
