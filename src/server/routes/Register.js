import { isEmail } from "validator";
import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";

export default class Register extends DefaultRoute {

    constructor(mainApp, parentApp) {
        super(mainApp, parentApp);
        this.routerNameSpace = "/register";
        this.routeOf = ["/", "/admin"];
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Register
     */
    async routeGet8email8password8matr(request, response) {

        if (!request.params.email || !isEmail(request.params.email)) return response.send({ success: false, error: { name: "notAnEmail" } });
        const user = new User({
            email: request.params.email,
            password: request.params.password,
            matriculationNumber: request.params.matr,
            locale: request.headers["accept-language"]
        });

        await User.register(user, request.params.password, (error) => {
            if (error) {
                response.send({ success: false, error });
            } else {
                response.json({ success: true });
            }
        });
    }
}
