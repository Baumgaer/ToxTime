import { install } from "source-map-support";
if (process.env.NODE_ENV === "development") install();

import express, { json, urlencoded } from 'express';
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
import httpErrors from "http-errors";
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";

import { toURIPathPart } from "~common/utils";
import User from "~server/models/User";

/**
 * This is base server of a web server with standard setup, security and basic routes
 *
 * @class WebServer
 */
class WebServer {

    constructor() {
        console.debug("1. Setting up server");

        /** @type {Promise[]} */
        this.awaitingActions = [];
        this.databaseURI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE_NAME}`;

        /** @type {mongoose.ConnectOptions} */
        this.dbSettings = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        // NOTE: Only add authentication data when everything is given.
        // Otherwise there will be an illogical error when trying to connect to database.
        if (process.env.DB_USER && process.env.DB_USER_PASSWORD) {
            Object.assign(this.dbSettings, {
                user: process.env.DB_USER,
                password: process.env.DB_USER_PASSWORD
            });
        }

        this.app = express();
        this.server = createServer(this.app);
        this.sessionSecret = createHash("sha512").update(process.env.SESSION_SECRET).digest("base64");

        try {
            this.setupGeneralSettings();
            this.setupSecurity();
            this.setupSession();
            this.setupRoutes();
        } catch (error) {
            if (process.env.NODE_ENV === "development") throw error;
            console.error(`1.1 Server not started. Reason: ${error}`);
        }
    }

    async setupGeneralSettings() {
        console.debug("2. Preparing server");
        // parse the body to get post data and so on
        // NOTE: This is important for some middlewares to have directly.
        //       So this has to be the first middleware
        this.app.use(json());
        this.app.use(urlencoded({ extended: true }));
        this.app.use(compression());

        /**
         * requires all locales and adds them to an object
         *
         * @returns {Record<string, Record<string, string>>} the locale messages
         */
        function loadLocaleMessages() {
            const locales = require.context('~server/locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
            /** @type {Record<string, Record<string, string>>} */
            const messages = {};
            locales.keys().forEach(key => {
                const matched = key.match(/\.\/([A-Za-z0-9-_]+)/i);
                if (matched && matched.length > 1) {
                    const locale = matched[1];
                    messages[locale] = locales(key);
                }
            });
            return messages;
        }

        // Setup i18n for multi language
        i18next.use(i18nextMiddleware.LanguageDetector).init({
            defaultNS: "",
            lng: "cimode",
            lowerCaseLng: true,
            fallbackLng: "en-us",
            resources: loadLocaleMessages()
        });
        this.app.use(i18nextMiddleware.handle(i18next));

        console.debug("2.1 Connecting to database");
        try {
            await mongoose.connect(this.databaseURI, this.dbSettings);
            mongoose.set('useCreateIndex', true);
            console.debug("2.1.1 Database connection established");
        } catch (error) {
            console.error(`2.1.1 Could not connect to database. Reason: ${error}`);
        }

    }

    setupSecurity() {
        console.debug("3. Setup server security");
        this.app.use((request, response, next) => {
            const contentSecurityNonce = uuidV4();
            response.locals.cspNonce = contentSecurityNonce;

            const styleSrc = ["'self'"];
            const scriptSrc = styleSrc;
            if (process.env.NODE_ENV === 'development') {
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
            expires: ms(process.env.SESSION_MAX_AGE),
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

        this.app.use(expressSession({
            secret: this.sessionSecret,
            cookie: { maxAge: ms(process.env.SESSION_MAX_AGE) },
            store,
            resave: true,
            saveUninitialized: true
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        passport.use("local", new PassportStrategy({ usernameField: "email" }, User.authenticate()));
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());
    }

    setupRoutes() {
        console.debug("5. Collecting routes");
        const apps = require.context('~server/app', true, /[A-Za-z0-9-_,\s]+\.js$/i);

        // Collect apps which will collect their routes
        apps.keys().forEach((key) => {
            /** @type {import("./lib/DefaultApp")["default"]} */
            const app = apps(key).default;
            const clApp = new app(this.app, this.server);
            clApp.routerNamespace = toURIPathPart(clApp.routerNamespace);
            clApp.collectRoutes();
            this.app.use(clApp.routerNamespace, clApp.router);
        });

        // Route not found
        this.app.use((_request, _response, next) => {
            next(httpErrors.NotFound());
        });
    }

    async start() {
        try {
            await Promise.race(this.awaitingActions);
            console.info("6. Starting server");
            this.server.listen(process.env.APP_PORT, process.env.APP_HOST, null, () => {
                console.info(`6.1 server is running and reachable on http://${process.env.APP_HOST}:${process.env.APP_PORT}`);
            });
        } catch (_error) {
            console.error(`Server not started! Not all awaiting actions are resolved`);
        }
    }
}

const server = new WebServer();
server.start();
