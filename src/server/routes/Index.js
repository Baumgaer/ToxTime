import DefaultRoute from "~server/lib/DefaultRoute";

export default class Index extends DefaultRoute {

    namespace = "/";

    /**
     * Sends the initial file when not logged in.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Index
     */
    @Index.get("/", { public: true })
    sendIndexFile(request, response) {
        this.renderPage(request, response);
    }
}
