import DefaultRoute from "~server/lib/DefaultRoute";

export default class Admin extends DefaultRoute {

    /**
     * Sends the initial file when not logged in.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Admin
     */
    @Admin.get("/")
    sendAdminFile(request, response) {
        this.renderPage(request, response);
    }
}
