import { isEmail } from "validator";
import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";

export default class Users extends DefaultRoute {

    /**
     * test
     *
     * @param {import("express").Request} _request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Register
     */
    @Users.get("/")
    async getAll(_request, response) {
        let users = null;
        try {
            users = await User.find({}).exec();
        } catch (error) {
            return response.send({ success: false, error });
        }
        response.send({ success: true, data: { models: users || [] } });
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Register
     */
    @Users.get("/:id")
    async getById(request, response) {
        let user = null;
        try {
            user = User.findById(request.params.id);
        } catch (error) {
            return response.send({ success: false, error });
        }
        response.send({ success: true, data: { models: [user] } });
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Register
     */
    @Users.post("/register")
    async register(request, response) {
        if (!request.body.email || !isEmail(request.body.email)) return response.send({ success: false, error: { name: "notAnEmail" } });
        const result = await Users.registerUser({
            email: request.body.email,
            password: request.body.password,
            matriculationNumber: request.body.matr,
            locale: request.headers["accept-language"]
        }, request.body.password);
        response.send(result);
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

}
