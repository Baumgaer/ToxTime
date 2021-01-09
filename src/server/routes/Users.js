import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";

export default class Users extends DefaultRoute {

    constructor(mainApp, parentApp) {
        super(mainApp, parentApp);
        this.routerNameSpace = "/users";
        this.routeOf = ["/admin"];
    }

    /**
     * test
     *
     * @param {import("express").Request} _request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Register
     */
    @Users.get("/")
    async routeGet(_request, response) {
        let users = null;
        try {
            users = await User.find({}).exec();
        } catch (error) {
            return response.send({ success: false, error });
        }
        response.send({ success: true, data: { models: users || [] } });
    }

}
