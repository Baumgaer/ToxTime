import fs from "graceful-fs";
import arp from "app-root-path";
import path from "path";
import httpErrors from "http-errors";
import lodash from "lodash";
import CustomError from "~common/lib/CustomError";
import { getPrototypeNamesRecursive } from "~common/utils";

export const registeredRoutes = {};

/**
 * @typedef {Object} RouteOptions
 * @property {boolean} public
 * @property {boolean} allowUser
 *
 * @typedef {Object} RouteObject
 * @property {import("express").RequestHandler} handler
 * @property {RouteOptions} options
 * @property {import("express").RequestHandler[]} middlewares
 *
 * @typedef {[import("express").Request, import("express").Response, import("express").NextFunction]} RequestHandlerArgs
 * @typedef { "GET" | "POST" | "PUT" | "PATCH" | "DELETE" } HttpMethods
 * @typedef {Record<string, Record<HttpMethods, RouteObject>>} RouteCollection
 *
 */
export default class DefaultRoute {

    /** @type {string} */
    namespace = "";

    /** @type {Record<string, string>} */
    _renderedPages = {};

    constructor(webServer, renderEngine) {
        /** @type {import("~server/main").default} */
        this.webServer = webServer;

        /** @type {import("nunjucks").Environment} */
        this.renderEngine = renderEngine;
    }

    /**
     * Registers a ALL route with its uri, options and assigns middlewares
     *
     * @static
     * @decorator
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof DefaultRoute
     */
    static all(uri, options = {}, ...middlewares) {
        return (target, method) => {
            this._registerRoute(target, method, options, "GET", uri, middlewares);
            this._registerRoute(target, method, options, "POST", uri, middlewares);
            this._registerRoute(target, method, options, "PUT", uri, middlewares);
            this._registerRoute(target, method, options, "PATCH", uri, middlewares);
            this._registerRoute(target, method, options, "DELETE", uri, middlewares);
        };
    }

    /**
     * Registers a GET route with its uri, options and assigns middlewares
     *
     * @static
     * @decorator
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof DefaultRoute
     */
    static get(uri, options = {}, ...middlewares) {
        return (target, method) => {
            this._registerRoute(target, method, options, "GET", uri, middlewares);
        };
    }

    /**
     * Registers a POST route with its uri, options and assigns middlewares
     *
     * @static
     * @decorator
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof DefaultRoute
     */
    static post(uri, options = {}, ...middlewares) {
        return (target, method) => {
            this._registerRoute(target, method, options, "POST", uri, middlewares);
        };
    }

    /**
     * Registers a PUT route with its uri, options and assigns middlewares
     *
     * @static
     * @decorator
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof DefaultRoute
     */
    static put(uri, options = {}, ...middlewares) {
        return (target, method) => {
            this._registerRoute(target, method, options, "PUT", uri, middlewares);
        };
    }

    /**
     * Registers a PATCH route with its uri, options and assigns middlewares
     *
     * @static
     * @decorator
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof DefaultRoute
     */
    static patch(uri, options = {}, ...middlewares) {
        return (target, method) => {
            this._registerRoute(target, method, options, "PATCH", uri, middlewares);
        };
    }

    /**
     * Registers a DELETE route with its uri, options and assigns middlewares
     *
     * @static
     * @decorator
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof DefaultRoute
     */
    static delete(uri, options = {}, ...middlewares) {
        return (target, method) => {
            this._registerRoute(target, method, options, "DELETE", uri, middlewares);
        };
    }

    /**
     * Registers a new route in the metadata storage which can then be collected
     * by an app.
     *
     * @static
     * @param { typeof import("~server/lib/DefaultRoute").default } target
     * @param { string } handlerName
     * @param {RouteOptions} options
     * @param { HttpMethods } method
     * @param { string } path
     * @param { import("express").RequestHandler[] } middlewares
     * @returns {void}
     * @memberof DefaultRoute
     */
    static _registerRoute(target, handlerName, options, method, path, middlewares) {
        const handler = target[handlerName];
        if (!registeredRoutes[target.constructor.name]) registeredRoutes[target.constructor.name] = {};
        lodash.merge(registeredRoutes[target.constructor.name], { [path]: { [method.toLowerCase()]: { handler, options, middlewares } } });
    }

    get routes() {
        const prototypeNames = getPrototypeNamesRecursive(this).reverse().filter((name) => name in registeredRoutes);
        const routes = {};
        for (const prototypeName of prototypeNames) lodash.merge(routes, registeredRoutes[prototypeName]);
        return routes;
    }

    /**
     * Registers a new route in the metadata storage which can then be collected
     * by an app.
     *
     * @static
     * @param {RouteObject} routeObject
     * @param {import("express").Request} request
     * @param {import("express").Response} response
     * @param {import("express").NextFunction} next
     * @returns {void}
     * @memberof DefaultRoute
     */
    async handle(routeObject, request, response, next) {
        console.info(`${request.connection.remoteAddress} ${request.method} ${request.originalUrl}`);
        const options = routeObject.options;
        if (!options?.public && (!request.user || !options?.allowUser && !request.user.isAdmin)) return next(httpErrors.Unauthorized());
        if (request.user?.passwordResetToken) {
            request.user.passwordResetToken = undefined;
            await request.user.save();
        }
        try {
            const result = await routeObject.handler.call(this, request, response, next);
            if (response.headersSent) return;
            if (!result) {
                response.json({ success: true, data: {} });
            } else if (result instanceof CustomError) {
                response.status((new httpErrors.BadRequest()).statusCode).json({ success: false, error: result });
            } else if (httpErrors.isHttpError(result)) {
                next(result);
            } else if (typeof result === "string") {
                response.send(result);
            } else if (typeof result === "object") {
                response.json({ success: true, data: result });
            } else if (result != null) next(httpErrors.InternalServerError(`Unacceptable result: ${JSON.stringify(result)}`));
        } catch (error) {
            next(httpErrors(500, error));
        }
    }

    /**
     * Renders a page depending on the current route namespace or the given
     * name as file name without extension.
     * It will include user information, a nonce and environment variables which are
     * allowed to be exposed to the frontend by adding then to FRONTEND_EXPOSED_CONFIG.
     *
     * @param {import("express").Request} request
     * @param {import("express").Response} response
     * @param {string} [name]
     * @returns {string}
     * @memberof DefaultRoute
     */
    async renderPage(request, response, name) {
        const staticPath = path.resolve(arp.path, process.environment.PATH_STATIC_FILES);
        const proto = Reflect.getPrototypeOf(this);
        const namespace = this.namespace || "/" + proto.constructor.name.toLowerCase();
        const ownHtmlName = `${name || namespace.substring(1) || "index"}.html`;
        if (!this._renderedPages[ownHtmlName]) this._renderedPages[ownHtmlName] = fs.readFileSync(path.resolve(staticPath, ownHtmlName)).toString();
        const environment = {};
        const configNames = process.environment.FRONTEND_EXPOSED_CONFIG.split(",").map((configName) => configName.trim());
        for (const configName of configNames) {
            environment[configName] = process.environment[configName];
        }
        return this.renderEngine.renderString(this._renderedPages[ownHtmlName], {
            userInformation: JSON.parse(JSON.stringify((request.user || {}))),
            nonce: response.locals.cspNonce,
            process: { environment }
        });
    }

}
