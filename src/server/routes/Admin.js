import DefaultRoute from "~server/lib/DefaultRoute";

export default class Admin extends DefaultRoute {

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {string}
     * @memberof Admin
     */
    @Admin.get("/")
    sendAdminFile(request, response) {
        return this.renderPage(request, response);
    }
}
