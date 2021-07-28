import fs from "graceful-fs";
import arp from "app-root-path";
import path from "path";
import httpErrors, { isHttpError } from "http-errors";
import CustomError from "~common/lib/CustomError";
import { getPrototypeNamesRecursive, merge, isValue, isMongoId } from "~common/utils";
import fresh from "fresh";
import { fromBuffer } from "file-type";

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
        merge(registeredRoutes[target.constructor.name], { [path]: { [method.toLowerCase()]: { handler, options, middlewares } } });
    }

    get routes() {
        const prototypeNames = getPrototypeNamesRecursive(this).reverse().filter((name) => name in registeredRoutes);
        const routes = {};
        for (const prototypeName of prototypeNames) merge(routes, registeredRoutes[prototypeName]);
        return routes;
    }

    /**
     * Registers a new route in the metadata storage which can then be collected
     * by an app.
     *
     * @param {import("express").Request} request
     * @param {import("express").Response} response
     * @returns {boolean}
     * @memberof DefaultRoute
     */
    isFresh(request, response) {
        return fresh(request.headers, {
            'ETag': response.getHeader('ETag'),
            'Last-Modified': response.getHeader('Last-Modified')
        });
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
        if (!options?.public && (!request.user || !options?.allowUser && !request.user.isAdmin)) {
            return response.sendStatus(httpErrors.Unauthorized().statusCode);
        }

        // Reset every passwordResetToken, when the user navigates normally
        // (password reset was may be not triggered by the real user or by mistake)
        if (request.user?.passwordResetToken) {
            request.user.passwordResetToken = undefined;
            try {
                await request.user.save();
            } catch (error) {
                console.error(error);
            }
        }

        if (request.params.id && isMongoId(request.params.id) && this.claimedExport) {
            request.object = await this.claimedExport.Model.findById(request.params.id).exec();
            if (!request.object) {
                const httpError = httpErrors.NotFound();
                response.status(httpError.statusCode).send(httpError);
                return;
            }
        }

        try {
            const result = await routeObject.handler.call(this, request, response, next);
            if (response.headersSent) return;

            if (!isValue(result)) {
                // Nothing was returned, so we assume, that the content is empty
                // if no other status code was set
                const code = response.statusCode;
                response.status(code === 200 ? 204 : code).json({}); // no content
            } else if (typeof result === "boolean") {
                // When a boolean was set, we assume, that the request was
                // accepted or not depending on boolean
                if (!result) {
                    const httpError = httpErrors.NotAcceptable();
                    response.status(httpError.statusCode).send(httpError);
                } else response.status(202).json({}); // accepted
            } else if (result instanceof Error || result instanceof CustomError) {
                // An error occurred. When this error is an http error, we don't
                // want to print this error with trace because this was calculated and
                // is visible in browser. all other errors should be printed.
                if (!isHttpError(result)) {
                    console.error(result);
                    response.status(httpErrors.BadRequest().statusCode).json(result);
                } else {
                    console.info(`${request.connection.remoteAddress} ${request.method} ${request.originalUrl} ${result.message}`);
                    response.status(result.statusCode).send(result.stack);
                }
            } else if (result instanceof fs.ReadStream) {
                result.pipe(response);
            } else if (typeof result === "string" || result instanceof Buffer) {
                // Normally a string will be returned if we want to send a page
                // (html or text). It is also possible to send a file here,
                // especially when the result is a buffer.
                // In this case the content type has to be set manually.
                if (result instanceof Buffer && !response.getHeader("Content-Type")) {
                    const type = await fromBuffer(result);
                    response.setHeader("Content-Type", type.mime);
                }
                response.send(result);
            } else if (typeof result === "object") {
                // This is a general response. Normally all responses should be
                // a JSON since this is a rest service.
                response.json(result);
            } else if (typeof result === "number") {
                // A number means we just want to have a certain response code with no content
                response.sendStatus(result);
            } else if (isValue(result)) {
                // A return value which is not allowed is returned. This has to
                // be printed with full trace because it's just wrong...
                next(httpErrors.InternalServerError(`Unacceptable result: ${JSON.stringify(result)}`));
            }
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
