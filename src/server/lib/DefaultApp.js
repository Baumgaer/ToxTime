import { Router, static as expressStatic } from "express";
import path from "path";
import { path as rootPath } from "app-root-path";
import httpErrors from "http-errors";
import { readFileSync } from "graceful-fs";
import { toURIPathPart } from "~common/utils";

export default class DefaultApp {

    constructor(app, server, renderEngine) {
        /** @type {import("express").Application} */
        this.app = app;

        /** @type {import("http").Server} */
        this.server = server;

        /** @type {import("nunjucks").Environment} */
        this.renderEngine = renderEngine;

        /** @type {string} */
        this.routerNamespace = "/";

        /** @type {string | null} */
        this.loadedIndex = null;

        /** @type {ReturnType<import("express")["Router"]>} */
        this.router = Router();
        this.router.use((request, response, next) => this.sendStaticFile(request, response, next));

    }

    async renderPage(request, response, next, name) {
        const staticPath = path.resolve(rootPath, process.environment.PATH_STATIC_FILES);
        const ownHtmlName = `${name || this.namespace.substring(1) || "index"}.html`;
        if (!this.loadedIndex) this.loadedIndex = readFileSync(path.resolve(staticPath, ownHtmlName)).toString();
        response.send(this.renderEngine.renderString(this.loadedIndex, {
            userInformation: JSON.parse(JSON.stringify((request.user || {}))),
            nonce: response.locals.cspNonce
        }));
    }

}
