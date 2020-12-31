import { camelCaseToKebabCase, getAllFuncs, toURIPathPart } from "~common/utils";
import { flattenDeep } from "lodash";
import path from "path";
import { path as rootPath } from "app-root-path";

/**
 * @typedef {Object} RouteObject
 * @property {string} path
 * @property {string} method
 * @property {import("express").RequestHandler} handler
 */
export default class DefaultRoute {

    constructor(mainApp, parentApp) {
        this.mainApp = mainApp;
        this.parentApp = parentApp;
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

        routes.sort((a, b) => {
            return b.path.split("/").length - a.path.split("/").length;
        });

        return routes;
    }

    /**
     * test
     *
     * @param {import("express").Response} response the response
     * @param {string} fileName the name of the file to send
     * @returns {void}
     * @memberof Login
     */
    sendStaticFile(response, fileName = "index.html") {
        response.sendFile(fileName, { root: path.resolve(rootPath, process.env.PATH_STATIC_FILES || ".") }, (err) => {
            response.end();
            if (err) throw (err);
        });
    }

}
