import DefaultRoute from "~server/lib/DefaultRoute";

export default class Error extends DefaultRoute {

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {number}
     * @memberof Error
     */
    @Error.post("/", { allowUser: true })
    printClientErrorToConsole(request) {
        console.error(`Client: ${request.user?.email || "anonymous"} had error: ${request.body.error}`);
        return 200;
    }
}
