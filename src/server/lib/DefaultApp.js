import { Router, static as expressStatic } from "express";
import path from "path";
import { path as rootPath } from "app-root-path";

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
        this.router.use(expressStatic(path.resolve(rootPath, process.env.PATH_STATIC_FILES)));
    }
}
