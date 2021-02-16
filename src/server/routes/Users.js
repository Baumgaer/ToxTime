import ApiRoute from "~server/lib/ApiRoute";
import User from "~server/models/User";
import { isMongoId } from "~common/utils";
import EmailTransporter from "~server/lib/EmailTransporter";
import { randomBytes } from "crypto";
import { v4 as uuid } from "uuid";
import normalizeURL from "normalize-url";
import httpErrors from "http-errors";
import CustomError from "~common/lib/CustomError";

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

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {string}
     * @memberof ApiRoute
     */
    @ApiRoute.patch("/:id", { allowUser: true })
    async update(request) {
        if (!isMongoId(request.params.id)) return httpErrors.BadRequest();
        if (!request.user.isAdmin && request.user._id !== request.params.id) return new httpErrors.Forbidden();
        if (("isAdmin" in request.body || "isConfirmed" in request.body || "isActive" in request.body) && !request.user.isAdmin) return new httpErrors.Forbidden();
        delete request.body.hash;
        delete request.body.salt;

        const updateResult = await super.update(request);

        // eslint-disable-next-line no-unreachable
        if (request.body.oldPassword && (request.body.newPassword || request.body.repeatPassword) && request.params.id === request.user._id.toString()) {
            console.log("general allowed");
            const password = request.body.newPassword;
            const repeatPassword = request.body.repeatPassword;
            if (!password) return new CustomError("passwordNotFilled", "The password was not filled", { field: "newPassword" });
            if (!repeatPassword) return new CustomError("passwordNotFilled", "The password repeat was not filled", { field: "repeatPassword" });
            if (password !== repeatPassword) return new CustomError("passwordsNotEqual", "Password and password repeat are not equal", { field: "repeatPassword" });

            console.log("all tests passed");
            const chPasswordResult = await new Promise((resolve) => {
                request.user.changePassword(request.body.oldPassword, request.body.newPassword, (error) => {
                    if (error) return resolve(error);
                    resolve(request.user);
                });
            });
            console.log(chPasswordResult);
            if (chPasswordResult instanceof Error) return new CustomError("passwordIncorrect", "Password incorrect", { field: "oldPassword" });
        }
        return updateResult;
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
