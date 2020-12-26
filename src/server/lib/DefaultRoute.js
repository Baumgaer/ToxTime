import { camelCaseToKebabCase, getAllFuncs, toURIPathPart } from "~common/utils";
import { flattenDeep } from "lodash";

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
            if (typeof method !== "function" || !name.startsWith("route")) return;

            let convertedName = camelCaseToKebabCase(method.name).split("-");
            convertedName.shift();
            for (let [index, part] of convertedName.entries()) {
                convertedName[index] = `/${part.split("8").join("/:")}`;
            }
            convertedName = convertedName.map((part) => {
                return part.split("/").filter((item) => !!item);
            });

            convertedName = flattenDeep(convertedName);

            if (!["get", "post", "put", "patch", "delete"].includes(convertedName[0])) return;

            let path = this.routerNameSpace;
            for (const [index, part] of convertedName.entries()) {
                if (!index) {
                    route.method = part;
                    continue;
                }
                path += `/${part.replace(/8/g, "/:")}`;
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
     * @memberof DefaultRoute
     */
    routeGetTestLol8user(request, response) {
        response.send(request.params.user);
    }

}
