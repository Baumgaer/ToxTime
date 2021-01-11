import { isEmail } from "validator";
import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";
import CustomError from "~common/lib/CustomError";
import { randomBytes } from "crypto";
import EmailTransporter from "~server/lib/EmailTransporter";
import { v4 as uuid } from "uuid";
import normalizeURL from "normalize-url";
import { isMongoId } from "validator";
import httpErrors from "http-errors";

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
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        let user = null;
        try {
            user = User.findById(request.params.id).exec();
        } catch (error) {
            return error;
        }
        return { models: [user] };
    }

    @Users.delete("/delete/:id")
    async delete(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        try {
            const result = await User.findByIdAndDelete(request.params.id).exec();
            if (!result) return httpErrors.NotFound();
            return {};
        } catch (error) {
            return error;
        }
    }

    @Users.patch("/resentConfirm/:id")
    async resentConfirm(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        const token = uuid();
        try {
            const result = await User.findByIdAndUpdate(request.params.id, { passwordResetToken: token, isConfirmed: false }).exec();
            if (!result) return httpErrors.NotFound();
            const isSecure = process.environment.APP_SECURE;
            const emailTransporter = EmailTransporter.getInstance();
            await emailTransporter.send(request, {
                subject: "registrationEmail",
                to: result.email,
                locales: {
                    user: result,
                    url: normalizeURL(`${process.environment.APP_DOMAIN}/login/confirm/${token}`, { forceHttps: isSecure, forceHttp: !isSecure })
                }
            });
            return {};
        } catch (error) {
            return error;
        }
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
        if (!(request.body instanceof Array)) request.body = [request.body];
        const results = [];
        for (const userData of request.body) {
            if (!userData.email || !isEmail(userData.email)) {
                results.push(new CustomError("notAnEmail", "", { field: `email` }));
                continue;
            }
            const password = request.body.password || randomBytes(64);
            const token = uuid();
            try {
                // Create the user
                const originalUser = await Users.registerUser(Object.assign(userData, {
                    password: password,
                    locale: process.environment.APP_DEFAULT_LANGUAGE,
                    passwordResetToken: token
                }), password);

                // Copy and modify for response
                const modifiedUser = Object.assign({}, originalUser.toObject());
                delete modifiedUser.hash;
                delete modifiedUser.salt;
                delete modifiedUser.passwordResetToken;

                try {
                    // Send confirmation email
                    const isSecure = process.environment.APP_SECURE;
                    const emailTransporter = EmailTransporter.getInstance();
                    await emailTransporter.send(request, {
                        subject: "registrationEmail",
                        to: modifiedUser.email,
                        locales: {
                            user: modifiedUser,
                            url: normalizeURL(`${process.environment.APP_DOMAIN}/login/confirm/${token}`, { forceHttps: isSecure, forceHttp: !isSecure })
                        }
                    });
                    results.push(modifiedUser);
                } catch (error) {
                    try {
                        // revert inserting model because sending email failed
                        await User.findByIdAndDelete(originalUser._id);
                        console.error(error);
                        error.className = "Error";
                        results.push(error);
                    } catch (error) {
                        // Reverting failed... OMG...
                        console.error(error);
                        error.className = "Error";
                        results.push(error);
                    }
                }
            } catch (error) {
                // Creating user failed
                console.error(error);
                error.className = "Error";
                results.push(error);
            }
        }
        return { success: true, models: results };
    }

    static registerUser(data, password) {
        return new Promise((resolve, reject) => {
            const user = new User(data);
            User.register(user, password, (error) => {
                if (error) {
                    reject(error);
                } else resolve(user);
            });
        });
    }

}
