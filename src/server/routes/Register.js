import { isEmail } from "validator";
import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";

export default class Register extends DefaultRoute {

    constructor(mainApp, parentApp) {
        super(mainApp, parentApp);
        this.routerNameSpace = "/register";
        this.routeOf = ["/", "/admin"];
    }

    static registerUser(data, password) {
        return new Promise((resolve, reject) => {
            const user = new User(data);

            User.register(user, password, (error) => {
                if (error) {
                    reject({ success: false, error });
                } else {
                    resolve({ success: true });
                }
            });
        });
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
        const result = await Register.registerUser({
            email: request.params.email,
            password: request.params.password,
            matriculationNumber: request.params.matr,
            locale: request.headers["accept-language"]
        }, request.params.password);
        response.send(result);
    }
}
