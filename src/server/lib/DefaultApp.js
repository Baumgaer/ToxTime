import { Router, static as expressStatic } from "express";
import path from "path";
import { path as rootPath } from "app-root-path";
import httpErrors from "http-errors";
import { toURIPathPart } from "~common/utils";

export default class DefaultApp {

    constructor(app, server) {
        /** @type {import("express").Application} */
        this.app = app;

        /** @type {import("http").Server} */
        this.server = server;

        /** @type {string} */
        this.routerNamespace = "/";

        /** @type {boolean} */
        this.adminRightsNeeded = false;

        /** @type {boolean} */
        this.authenticatedOnly = false;

        /** @type {ReturnType<import("express")["Router"]>} */
        this.router = Router();
        this.router.use((request, response, next) => {
            if (this.authenticatedOnly && !request.user || this.adminRightsNeeded) return next(httpErrors.Unauthorized());
            expressStatic(path.resolve(rootPath, process.env.PATH_STATIC_FILES || "."))(request, response, next);
        });

    }

    /**
     * test
     *
     * @param {"GET" | "POST" | "PUT" | "PATCH" | "DELETE"} method the http method to use
     * @param {string} url the url on which the method should be reachable
     * @param {RequestHandler} handler the method handler
     * @returns {void}
     * @memberof DefaultApp
     */
    addRoute(method, url, handler) {
        const methodName = method.toLowerCase();
        this.router[methodName](toURIPathPart(url), (request, response, next) => this.handle(handler, request, response, next));
    }

    collectRoutes() {
        const routes = require.context("~server/routes", true, /\.js$/i, "sync");
        routes.keys().forEach((key) => {
            /** @type {import("./DefaultRoute")["default"]} */
            const route = routes(key).default;
            const clRoute = new route(this.app, this);
            if (!clRoute.routeOf || (clRoute.routeOf.length && !clRoute.routeOf.includes(this.routerNamespace))) return;
            clRoute.routerNameSpace = toURIPathPart(clRoute.routerNameSpace);
            const collectedRoutes = clRoute.collectRoutes();
            for (const collectedRoute of collectedRoutes) {
                this.addRoute(collectedRoute.method, collectedRoute.path, collectedRoute.handler);
            }
        });
    }

    /**
     * test
     *
     * @param {(handler: RequestHandler, request: Request, response: Response, next: NextFunction) => void} handler test
     * @param {import("express").Request} request test
     * @param {import("express").Response} response test
     * @param {import("express").NextFunction} next test
     * @returns {void}
     * @memberof DefaultApp
     */
    handle(handler, request, response, next) {
        if ((this.authenticatedOnly && !request.user) ||
            (this.adminRightsNeeded && (!request.user || request.user && !request.user.isAdmin))) return next(httpErrors.Unauthorized());
        handler(request, response, next);
    }

}
