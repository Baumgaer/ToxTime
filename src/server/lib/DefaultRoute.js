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

    constructor(mainApp, parentApp) {
        this.mainApp = mainApp;
        this.parentApp = parentApp;
        this.routerNameSpace = "/";
        this.routeOf = [];
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
    static _registerRoute(target, handlerName, options, method, path) {
        if (!Reflect.hasMetadata("routes", target)) Reflect.defineMetadata("routes", [], target);
        const routes = Reflect.getMetadata("routes", target);
        routes.push({ method, path, handlerName, options });
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

}
