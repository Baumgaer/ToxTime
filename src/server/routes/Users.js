import ApiRoute from "~server/lib/ApiRoute";
import User from "~server/models/User";
import { isMongoId } from "~common/utils";
import EmailTransporter from "~server/lib/EmailTransporter";
import CustomError from "~common/lib/CustomError";
import { isEmail } from "validator";
import { randomBytes } from "crypto";
import { v4 as uuid } from "uuid";
import normalizeURL from "normalize-url";
import httpErrors from "http-errors";

export default class Users extends ApiRoute {

    claimedExport = User;

    @Users.patch("/resentConfirm/:id")
    async resentConfirm(request) {
        if (!isMongoId(request.params.id)) return httpErrors.BadRequest();
        const token = uuid();
        try {
            const result = await User.Model.findByIdAndUpdate(request.params.id, { passwordResetToken: token, isConfirmed: false }).exec();
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

    @Users.patch("/toggleLock/:id")
    async toggleLock(request) {
        if (!isMongoId(request.params.id)) return httpErrors.BadRequest();
        try {
            const result = await User.Model.findById(request.params.id).exec();
            if (!result) return httpErrors.NotFound();
            result.isActive = !result.isActive;
            await result.save();
            return { models: [result] };
        } catch (error) {
            return error;
        }
    }

    /**
     * registers a new user with email, a password if given and a matriculation number
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response
     * @returns {void}
     * @memberof Register
     */
    @Users.post("/register")
    async register(request, response) {
        if (!(request.body instanceof Array)) request.body = [request.body];
        const results = [];
        for (const userData of request.body) {
            if (!userData.email || !isEmail(userData.email)) {
                results.push(new CustomError("notAnEmail", "", { field: `email` }));
                response.status(207);
                continue;
            }
            const password = request.body.password || randomBytes(64);
            const token = uuid();
            try {
                // Create the user
                const originalUser = await Users.registerUser(Object.assign(userData, {
                    password: password,
                    locale: process.environment.APP_DEFAULT_LANGUAGE,
                    passwordResetToken: token,
                    creator: request.user._id
                }), password);

                // Copy and modify for response
                const modifiedUser = Object.assign({}, originalUser.toObject());
                delete modifiedUser.hash;
                delete modifiedUser.salt;
                delete modifiedUser.passwordResetToken;

                if (!userData.isConfirmed) {
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
                            await User.Model.findByIdAndDelete(originalUser._id).exec();
                            console.error(error);
                            error.className = "Error";
                            results.push(error);
                            response.status(207);
                        } catch (error) {
                            // Reverting failed... OMG...
                            console.error(error);
                            error.className = "Error";
                            results.push(error);
                            response.status(207);
                        }
                    }
                } else results.push(modifiedUser);
            } catch (error) {
                // Creating user failed
                console.error(error);
                error.className = "Error";
                results.push(error);
                response.status(207);
            }
        }
        return results;
    }

    static registerUser(data, password, altModel) {
        return new Promise((resolve, reject) => {
            const TheModel = (altModel || User.Model);
            const user = new TheModel(data);
            TheModel.register(user, password, (error) => {
                if (error) {
                    reject(error);
                } else resolve(user);
            });
        });
    }

}
