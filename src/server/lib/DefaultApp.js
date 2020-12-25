import { Router, static as expressStatic } from "express";
import path from "path";
import { path as rootPath } from "app-root-path";
import passport from "passport";

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
        this.router.use(expressStatic(path.resolve(rootPath, process.env.PATH_STATIC_FILES || ".")));

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
        this.router[methodName](url, (request, response, next) => this[`handle${methodName.charAt(0).toUpperCase() + methodName.slice(1)}`](handler, request, response, next));
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
    handleGet(handler, request, response, next) {
        if (this.authenticatedOnly && !request.user || this.adminRightsNeeded) return response.send("Not Authenticated");
        handler(request, response, next);
        if (!response.headersSent) response.send(response.locales);
    }

}
