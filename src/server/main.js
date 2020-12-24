import { install } from "source-map-support";
if (process.env.NODE_ENV === "development") install();

import express, { json, urlencoded, static as expressStatic } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import expressSession from 'express-session';
import mongoDBSession from "connect-mongodb-session";
import { v4 as uuidV4 } from "uuid";
import { createServer } from 'http';
import path from "path";
import { path as rootPath } from "app-root-path";
import ms from "ms";
import { createHash } from 'crypto';
import { toURIPathPart } from "~common/utils";

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

    setupGeneralSettings() {
        console.debug("2. Preparing server");
        // parse the body to get post data and so on
        // NOTE: This is important for some middlewares to have directly.
        //       So this has to be the first middleware
        this.app.use(json());
        this.app.use(urlencoded({ extended: true }));
        this.app.use(compression());
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
        const uri = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE_NAME}`;
        console.info(`4. Connecting to session store ${uri}`);

        const MongoDBStore = mongoDBSession(expressSession);
        const store = new MongoDBStore({
            uri,
            collection: "sessions",
            expires: ms(process.env.SESSION_MAX_AGE)
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
    }

    setupRoutes() {
        console.debug("5. Collecting routes");
        this.app.use(expressStatic(path.resolve(rootPath, process.env.PATH_STATIC_FILES)));
        const apps = require.context('~server/app', true, /[A-Za-z0-9-_,\s]+\.js$/i);
        apps.keys().forEach((key) => {
            /** @type {import("./lib/DefaultApp")["default"]} */
            const app = apps(key).default;
            const clApp = new app(this.app, this.server);
            clApp.routerNamespace = toURIPathPart(clApp.routerNamespace);
            this.app.use(clApp.routerNamespace, clApp.router);
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
