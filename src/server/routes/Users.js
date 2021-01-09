import { isEmail } from "validator";
import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";

export default class Users extends DefaultRoute {

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @returns {void}
     * @memberof Register
     */
    @Users.get("/")
    async getAll(request) {
        request.body;
        let users = null;
        try {
            users = await User.find({}).exec();
        } catch (error) {
            return error;
        }
        return { models: users || [] };
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @returns {void}
     * @memberof Register
     */
    @Users.get("/:id")
    async getById(request) {
        let user = null;
        try {
            user = User.findById(request.params.id);
        } catch (error) {
            return error;
        }
        return { models: [user] };
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @returns {void}
     * @memberof Register
     */
    @Users.post("/register")
    async register(request) {
        if (!request.body.email || !isEmail(request.body.email)) return new Error("notAnEmail");
        const result = await Users.registerUser({
            email: request.body.email,
            password: request.body.password,
            matriculationNumber: request.body.matr,
            locale: request.headers["accept-language"]
        }, request.body.password);
        return result;
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
