import "reflect-metadata";
import "~server/convertEnvironment";
import express, { json, urlencoded, static as expressStatic, Router } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import expressSession from 'express-session';
import mongoDBSession from "connect-mongodb-session";
import { v4 as uuidV4 } from "uuid";
import { createServer } from 'http';
import ms from "ms";
import { createHash } from 'crypto';
import passport from "passport";
import { Strategy as PassportStrategy } from "passport-local";
import mongoose from "mongoose";
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import nunjucks from "nunjucks";
import pmx from "@pm2/io";
import normalizeURL from "normalize-url";
import arp from "app-root-path";
import path from "path";
import httpErrors from "http-errors";

import User from "~server/models/User";
import EmailTransporter from "~server/lib/EmailTransporter";
import { toURIPathPart } from "~common/utils";
import Users from "~server/routes/Users";

// @ts-ignore
import nunjucksConfig from "./../../nunjucks.config";

/**
 * This is base server of a web server with standard setup, security and basic routes
 *
 * @class WebServer
 */
export default class WebServer {

    constructor() {
        console.info("1. Setting up server");

        /** @type {Promise[]} */
        this.awaitingActions = [];
        this.databaseURI = `mongodb://${process.environment.DB_HOST}:${process.environment.DB_PORT}/${process.environment.DB_DATABASE_NAME}`;

        /** @type {mongoose.ConnectOptions} */
        this.dbSettings = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        // NOTE: Only add authentication data when everything is given.
        // Otherwise there will be an illogical error when trying to connect to database.
        if (process.environment.DB_USER && process.environment.DB_USER_PASSWORD) {
            Object.assign(this.dbSettings, {
                user: process.environment.DB_USER,
                password: process.environment.DB_USER_PASSWORD
            });
        }

        this.app = express();
        this.server = createServer(this.app);
        this.sessionSecret = createHash("sha512").update(process.environment.SESSION_SECRET).digest("base64");

        try {
            this.setupGeneralSettings();
            this.setupSecurity();
            this.setupSession();
            this.setupRoutes();
        } catch (error) {
            if (process.environment.NODE_ENV === "development") throw error;
            console.error(`1.1 Server not started. Reason: ${error}`);
        }
    }

    async setupGeneralSettings() {
        console.info("2. Preparing server");
        // parse the body to get post data and so on
        // NOTE: This is important for some middlewares to have directly.
        //       So this has to be the first middleware
        this.app.use(json());
        this.app.use(urlencoded({ extended: true }));
        this.app.use(compression());
        if (process.environment.APP_TRUST_PROXY) {
            this.app.set("trust proxy", process.environment.APP_TRUST_PROXY);
        }

        this.templateEnvironment = new nunjucks.Environment(null, { express: this.app });
        nunjucksConfig(this.templateEnvironment);

        const locales = require.context('~server/locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
        const resources = {};
        locales.keys().forEach(key => {
            const matched = key.match(/\.\/([A-Za-z0-9-_]+)/i);
            if (matched && matched.length > 1) {
                const locale = matched[1];
                resources[locale] = {
                    dict: locales(key)
                };
            }
        });

        // Setup i18n for multi language
        i18next.use(i18nextMiddleware.LanguageDetector).init({
            ns: "dict",
            defaultNS: "dict",
            lng: "cimode",
            lowerCaseLng: true,
            fallbackLng: process.environment.APP_DEFAULT_LANGUAGE,
            resources
        });
        this.app.use(i18nextMiddleware.handle(i18next));

        console.info("2.1 Connecting to database");
        try {
            await mongoose.connect(this.databaseURI, this.dbSettings);
            mongoose.set('useCreateIndex', true);
            console.info("2.1.1 Database connection established");
        } catch (error) {
            console.error(`2.1.1 Could not connect to database. Reason: ${error}`);
        }

        console.info("2.2 connecting to mail server");
        try {
            const emailTransporter = EmailTransporter.getInstance();
            const authInfo = (await emailTransporter.transporter).options.auth;
            console.info(`2.2.1 E-mail server connection established. Using user: ${authInfo.user}, pass: ${authInfo.pass}`);
        } catch (error) {
            console.error(`2.2.1 could not connect to mail server. Reason: ${error}`);
        }

    }

    setupSecurity() {
        console.info("3. Setup server security");
        this.app.use((request, response, next) => {
            const contentSecurityNonce = uuidV4();
            response.locals.cspNonce = contentSecurityNonce;

            const styleSrc = ["'self'"];
            const scriptSrc = styleSrc;
            if (process.environment.NODE_ENV === 'development') {
                styleSrc.push("'unsafe-eval'", "'unsafe-inline'");
            } else styleSrc.push(`'nonce-${contentSecurityNonce}'`);

            const helmetMiddleWare = helmet({
                contentSecurityPolicy: {
                    directives: { defaultSrc: ["'self'"], scriptSrc, styleSrc }
                }
            });
            helmetMiddleWare(request, response, next);
        });
        this.app.use(hpp());
    }

    setupSession() {
        console.info(`4. Connecting to session store ${this.databaseURI}`);

        const MongoDBStore = mongoDBSession(expressSession);
        const store = new MongoDBStore({
            uri: this.databaseURI,
            collection: "sessions",
            expires: ms(process.environment.SESSION_MAX_AGE),
            connectionOptions: this.dbSettings
        });

        this.awaitingActions.push(new Promise((resolve, reject) => {
            store.on("error", (error) => {
                console.error("4.1 Session store could not connect to Database. Reason:" + error.message);
                reject();
            });

            store.on("connected", () => {
                console.info("4.1 Session store connected to database");
                resolve();
            });
        }));

        const isSecure = process.environment.APP_SECURE;
        this.app.use(expressSession({
            secret: this.sessionSecret,
            cookie: {
                httpOnly: true,
                domain: new URL(normalizeURL(process.environment.APP_DOMAIN, { forceHttps: isSecure, forceHttp: !isSecure })).hostname, // protocol dues not mapper
                secure: isSecure,
                maxAge: ms(process.environment.SESSION_MAX_AGE)
            },
            store,
            resave: true,
            saveUninitialized: false,
            name: process.environment.APP_NAME,
            rolling: true,
            unset: "destroy"
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        passport.use("local", new PassportStrategy({ usernameField: "email" }, User.Model.authenticate()));
        passport.serializeUser(User.Model.serializeUser());
        passport.deserializeUser(User.Model.deserializeUser());
    }

    setupRoutes() {
        console.info("5. Collecting routes");
        const routes = require.context("~server/routes", true, /\.js$/i, "sync");

        // First register all routes
        routes.keys().forEach((key) => {
            /** @type {import("~server/lib/DefaultRoute")["default"]} */
            const route = routes(key).default;
            const clRoute = new route(this, this.templateEnvironment);
            const namespace = clRoute.namespace || "/" + route.name.toLowerCase();
            const registeredRoutes = Reflect.getMetadata("routes", clRoute);
            const router = Router();
            for (const aRoute of registeredRoutes) {
                if (process.environment.DEBUG) console.debug(`5.1 adding route ${aRoute.method} ${toURIPathPart(namespace + aRoute.path)} ${JSON.stringify(aRoute.options)}`);
                router[aRoute.method](aRoute.path, ...aRoute.middlewares, (request, response, next) => clRoute.handle(aRoute, request, response, next));
            }
            this.app.use(namespace, router);
        });

        // If route not found, try to find a static file
        this.app.use(expressStatic(path.resolve(arp.path, process.environment.PATH_STATIC_FILES)));

        this.app.use("*", (request, response, next) => {
            console.info(`${request.connection.remoteAddress} ${request.method} NOT FOUND ${request.originalUrl}`);
            next(httpErrors.NotFound());
        });
    }

    async start() {
        try {
            await Promise.race(this.awaitingActions);
            console.info("6. Starting server");
            this.server.listen(process.environment.APP_HTTP_PORT, process.environment.APP_HOST, null, () => {
                console.info(`6.1 server is running and reachable on http://${process.environment.APP_HOST}:${process.environment.APP_HTTP_PORT}`);
                process.send('ready');
            });
        } catch (_error) {
            console.error(`Server not started! Not all awaiting actions are resolved`);
            process.exit(1);
        }
    }
}

pmx.action('register:user', { comment: "registers a new user" }, async (parameter, reply) => {
    console.log(parameter);
    try {
        const data = JSON.parse(parameter.replace(/'/g, "\""));
        const password = data.password;
        console.info(`registering user ${data.email} via command`);
        const result = await Users.registerUser(data, password);
        reply({ success: true, result });
    } catch (error) {
        console.error(error);
        reply({ success: false, error });
    }
});

const server = new WebServer();
server.start();
