import httpErrors from "http-errors";

/**
 * @typedef {Object} RouteOptions
 * @property {boolean} public
 * @property {boolean} allowUser
 * @property {}
 *
 * @typedef {[import("express").Request, import("express").Response, import("express").NextFunction]} RequestHandlerArgs
 */

export default class Route {

    /**
     * Overwrites the default descriptor of the method to be able to do things
     * before and after the route call.
     *
     * @static
     * @param { TypedPropertyDescriptor<any> } descriptor
     * @param { RouteOptions } options
     * @returns { PropertyDescriptor }
     * @memberof Route
     */
    static _overwriteDescriptor(descriptor, options) {
        const originalMethod = descriptor.value;

        // NOTE: this has to be an old style function to have access to the "this"
        // of the corresponding descriptor. DO NOT CHANGE TO ARROWFUNCTION!
        descriptor.value = function (/** @type {RequestHandlerArgs} */...args) {
            const [request, response, next] = args;
            console.info(`${request.connection.remoteAddress} ${request.method} ${request.originalUrl}`);
            if (!options?.public) Route._checkAccess(request, response, next, options);
            return originalMethod.apply(this, args);
        };

        return descriptor;
    }

    /**
     * Checks if the request is allowed to give accessible response depending
     * on route options. Will call the error route if access is denied and return
     * a corresponding boolean.
     *
     * @static
     * @param { import("express").Request } request
     * @param { import("express").Response } response
     * @param { import("express").NextFunction } next
     * @param { RouteOptions } options
     * @returns { boolean }
     * @memberof Route
     */
    static _checkAccess(request, response, next, options) {
        if (!options?.public && !request.user || !options?.allowUser && !request.user.isAdmin) {
            next(httpErrors.Unauthorized());
            return false;
        }
        return true;
    }

    static _registerRoute(target, handler, method, uri, middlewares) { }

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
        return (target, method, descriptor) => {
            this._registerRoute(target, target[method], "GET", uri, middlewares);
            return this._overwriteDescriptor(descriptor, options);
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
        return (target, method, descriptor) => {
            this._registerRoute(target, target[method], "POST", uri, middlewares);
            return this._overwriteDescriptor(descriptor, options);
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
        return (target, method, descriptor) => {
            this._registerRoute(target, target[method], "PUT", uri, middlewares);
            return this._overwriteDescriptor(descriptor, options);
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
        return (target, method, descriptor) => {
            this._registerRoute(target, target[method], "PATCH", uri, middlewares);
            return this._overwriteDescriptor(descriptor, options);
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
        return (target, method, descriptor) => {
            this._registerRoute(target, target[method], "DELETE", uri, middlewares);
            return this._overwriteDescriptor(descriptor, options);
        };
    }
}
