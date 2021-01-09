import DefaultRoute from "~server/lib/DefaultRoute";

export default class Public extends DefaultRoute {

    /**
     * Sends the initial file when not logged in.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {string}
     * @memberof Public
     */
    @Public.get("/", { allowUser: true })
    sendPublicFile(request, response) {
        return this.renderPage(request, response);
    }
}
