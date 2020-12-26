import { camelCaseToKebabCase, getAllFuncs, toURIPathPart } from "~common/utils";

/**
 * @typedef {Object} RouteObject
 * @property {string} path
 * @property {string} method
 * @property {import("express").RequestHandler} handler
 */
export default class DefaultRoute {

    constructor(mainApp, subApp) {
        this.mainApp = mainApp;
        this.subApp = subApp;
        this.routerNameSpace = "/";
        this.routeOf = [];
    }

    /**
     * collects all routes defined by the methods starting with get, post, put, patch or delete.
     * Path parts are splitted by camel case and parameters are marked by an 8 in front of them.
     *
     * @returns {RouteObject[]}
     * @memberof DefaultRoute
     */
    collectRoutes() {
        const routes = [];

        getAllFuncs(this).forEach(name => {
            const route = {};
            const method = this[name];
            if (typeof method !== "function" && method.name) return;
            const convertedName = camelCaseToKebabCase(method.name).split("-");

            if (!["get", "post", "put", "patch", "delete"].includes(convertedName[0])) return;

            let path = this.routerNameSpace;
            for (const [index, part] of convertedName.entries()) {
                if (!index) {
                    route.method = part;
                    continue;
                }
                path += `/${part.replace("8", "/:")}`;
            }

            route.path = toURIPathPart(path);
            route.handler = method.bind(this);
            routes.push(route);
        });

        return routes;
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof AdminApp
     */
    getTestLol8user(request, response) {
        response.send(request.params.user);
    }

}
