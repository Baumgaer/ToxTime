import fs from "graceful-fs";
import arp from "app-root-path";
import path from "path";


/**
 * @typedef {Object} RouteOptions
 * @property {boolean} public
 * @property {boolean} allowUser
 *
 * @typedef {Object} RouteObject
 * @property {string} path
 * @property {string} method
 * @property {string} handlerName
 * @property {RouteOptions} options
 *
 * @typedef {[import("express").Request, import("express").Response, import("express").NextFunction]} RequestHandlerArgs
 * @typedef { "GET" | "POST" | "PUT" | "PATCH" | "DELETE" } HttpMethods
 */
export default class DefaultRoute {

    /** @type {string} */
    namespace = "";

    constructor(webServer, renderEngine) {
        /** @type {import("~server/main").default} */
        this.webServer = webServer;

        /** @type {import("nunjucks").Environment} */
        this.renderEngine = renderEngine;

        /** @type {Record<string, string>} */
        this._renderedPages = {};
    }

    /**
     * Registers a ALL route with its uri, options and assigns middlewares
     *
     * @static
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof Route
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
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof Route
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
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof Route
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
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof Route
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
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof Route
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
     * @param {string} uri
     * @param {RouteOptions} [options={}]
     * @param {import("express").RequestHandler[]} middlewares
     * @returns {MethodDecorator}
     * @memberof Route
     */
    static delete(uri, options = {}, ...middlewares) {
        return (target, method) => {
            this._registerRoute(target, method, options, "DELETE", uri, middlewares);
        };
    }

    async renderPage(request, response, name) {
        const staticPath = path.resolve(arp.path, process.environment.PATH_STATIC_FILES);
        const proto = Reflect.getPrototypeOf(this);
        const namespace = this.namespace || "/" + proto.constructor.name.toLowerCase();
        const ownHtmlName = `${name || namespace.substring(1) || "index"}.html`;
        if (!this._renderedPages[ownHtmlName]) this._renderedPages[ownHtmlName] = fs.readFileSync(path.resolve(staticPath, ownHtmlName)).toString();
        const environment = {};
        for (const configName of process.environment.FRONTEND_EXPOSED_CONFIG.split(",")) {
            environment[configName] = process.environment[configName];
        }
        response.send(this.renderEngine.renderString(this._renderedPages[ownHtmlName], {
            userInformation: JSON.parse(JSON.stringify((request.user || {}))),
            nonce: response.locals.cspNonce,
            environment: environment
        }));
    }

    /**
     * Registers a new route in the metadata storage which can then be collected
     * by an app.
     *
     * @static
     * @param { typeof import("~server/lib/DefaultRoute").default } target
     * @param { string } handlerName
     * @param { HttpMethods } method
     * @param { string } path
     * @param { import("express").RequestHandler[] } middlewares
     * @memberof Route
     */
    static _registerRoute(target, handlerName, options, method, path, middlewares) {
        const handler = target[handlerName];
        if (!Reflect.hasMetadata("routes", target)) Reflect.defineMetadata("routes", [], target);
        const routes = Reflect.getMetadata("routes", target);
        routes.push({ method: method.toLowerCase(), path, handler, options, middlewares });
    }

}
