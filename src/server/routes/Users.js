import { isEmail } from "validator";
import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";
import { randomBytes } from "crypto";

export default class Users extends DefaultRoute {

    /**
     * collects all users and returns them in a list.
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<{models: User[]} | Error>}
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
     * collects one user by its id if found
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<{models: [user]} | Error>}
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
     * registers a new user with email, a password if given and a matriculation number
     *
     * @param {import("express").Request} request the request
     * @returns {void}
     * @memberof Register
     */
    @Users.post("/register")
    async register(request) {
        if (!request.body.email || !isEmail(request.body.email)) return new Error("notAnEmail");
        const password = request.body.password || randomBytes(64);
        try {
            return await Users.registerUser({
                email: request.body.email,
                password: password,
                matriculationNumber: request.body.matriculationNumber,
                locale: request.i18n.language
            }, password);
        } catch (error) {
            return error;
        }
    }

    static registerUser(data, password) {
        return new Promise((resolve, reject) => {
            const user = new User(data);
            User.register(user, password, (error) => {
                if (error) {
                    reject(error);
                } else resolve({ models: [user] });
            });
        });
    }

}
