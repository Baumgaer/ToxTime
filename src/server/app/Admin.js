import DefaultApp from "~server/lib/DefaultApp";

/**
 * @typedef {import("express")} express
 */

export default class AdminApp extends DefaultApp {

    constructor(app, server) {
        super(app, server);
        this.routerNamespace = "/admin";
        this.authenticatedOnly = true;
        this.adminRightsNeeded = true;

        this.addRoute("GET", "/test", this.test.bind(this));
    }

    /**
     * test
     *
     * @param {import("express").Request} _request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof AdminApp
     */
    test(_request, response) {
        response.locals.lol = "ja ne";
        response.locals.test = true;
    }
}
