import passport from "passport";
import httpErrors from "http-errors";
import { isEmail } from "validator";
import { v4 as uuIDv4 } from "uuid";
import DefaultRoute from "~server/lib/DefaultRoute";
import EmailTransporter from "~server/lib/EmailTransporter";
import User from "~server/models/User";
import CustomError from "~common/lib/CustomError";
import { isUUID } from "validator";
import normalizeURL from "normalize-url";

export default class Login extends DefaultRoute {

    /**
     * redirects to the index page to show the login
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Login
     */
    @Login.get("/", { public: true })
    routeGet(request, response) {
        response.redirect("/");
    }

    /**
     * just returns the index page to enable the frontend to route to the
     * corresponding component.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {string}
     * @memberof Login
     */
    @Login.get("/reset", { public: true })
    sendLoginFile(request, response) {
        return this.renderPage(request, response, "index");
    }

    /**
     * Receives an email address and searches a user with this address.
     * If found, a token will be generated which will be sent in an email to
     * the received email address. If clicking on the link in that email,
     * the user can set a new password.
     * If no user was found, the server will just ignore that and tell the
     * frontend, dat an email was sent. This has some privacy and security reasons.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {Promise<{} | Error>}
     * @memberof Login
     */
    @Login.post("/reset", { public: true })
    async requestPasswordReset(request, response) {
        const email = request.body.email;
        if (!isEmail(email)) return response.send({ success: false, error: { name: "emailIncorrect" } });
        const emailTransporter = EmailTransporter.getInstance();
        try {
            let user = await User.Model.findOne({ email }).exec();
            if (user) {
                const token = uuIDv4();
                const isSecure = process.environment.APP_SECURE;
                user.passwordResetToken = token;
                await user.save();
                await emailTransporter.send(request, {
                    to: email,
                    subject: "resetPassword",
                    locales: {
                        domain: normalizeURL(process.environment.APP_DOMAIN, { forceHttps: isSecure, forceHttp: !isSecure }),
                        url: normalizeURL(`${process.environment.APP_DOMAIN}/login/reset/${token}`, { forceHttps: isSecure, forceHttp: !isSecure }),
                        user: user
                    }
                });
            } else console.info(`ignored email ${email} because no user was found`);
            return {};
        } catch (error) {
            return httpErrors.InternalServerError(error);
        }
    }

    /**
     * Checks if the received token is a token and a user has this token as a
     * value in passwordResetToken. If so, the user will be returned and an
     * http error else.
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<User["Model"] | Error>}
     * @memberof Login
     */
    static async checkPasswordResetToken(request, isConfirmed = true) {
        const token = request.params.token;
        if (!token || !isUUID(token, "4")) return httpErrors.BadRequest();
        try {
            const user = await User.Model.findOne({ passwordResetToken: token, isConfirmed, isActive: true }).exec();
            if (!user) return httpErrors.NotFound();
            return user;
        } catch (error) {
            return error;
        }
    }

    /**
     * checks if the token in the params is valid and renders the index page to
     * enable the frontend to show the corresponding component.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {Promise<string | Error>}
     * @memberof Login
     */
    @Login.get("/reset/:token", { public: true })
    async renderPasswordResetPage(request, response) {
        const result = await Login.checkPasswordResetToken(request);
        if (result instanceof Error) return result;
        return this.renderPage(request, response, "index");
    }

    /**
     * Receives a password and a repetition. If they are filled and equal and
     * the token exists on a user, the password of that user will be changed
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<{} | Error>}
     * @memberof Login
     */
    @Login.post("/reset/:token", { public: true })
    resetPassword(request) {
        return Login.reset(request);
    }

    /**
     * checks if the token in the params is valid and renders the index page to
     * enable the frontend to show the corresponding component.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {Promise<string | Error>}
     * @memberof Login
     */
    @Login.get("/confirm/:token", { public: true })
    async sendConfirmPage(request, response) {
        const result = await Login.checkPasswordResetToken(request, false);
        if (result instanceof Error) return result;
        return this.renderPage(request, response, "index");
    }

    /**
     * Receives a password and a repetition. If they are filled and equal and
     * the token exists on a user, the password of that user will be changed
     * and the account will be confirmed.
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<{} | Error>}
     * @memberof Login
     */
    @Login.post("/confirm/:token", { public: true })
    confirm(request) {
        return Login.reset(request, false, (user) => { user.isConfirmed = true; });
    }

    /**
     * Does the Password reset with checks and essential user manipulations
     *
     * @static
     * @param {import("express").Request} request
     * @param {boolean} [isConfirmed=true]
     * @param {(user: User["Model"]) => void} [additionalUserManipulations]
     * @returns {Promise<{} | Error>}
     * @memberof Login
     */
    static async reset(request, isConfirmed = true, additionalUserManipulations) {
        const password = request.body.password;
        const repeatPassword = request.body.repeatPassword;
        if (!passport) return new CustomError("passwordNotFilled", "The password was not filled", { field: "password" });
        if (!repeatPassword) return new CustomError("passwordNotFilled", "The password repeat was not filled", { field: "repeatPassword" });
        if (password !== repeatPassword) return new CustomError("passwordsNotEqual", "Password and password repeat are not equal", { field: "repeatPassword" });
        const user = await Login.checkPasswordResetToken(request, isConfirmed);
        if (user instanceof Error) return user;
        try {
            await user.setPassword(password);
            user.passwordResetToken = undefined;
            if (additionalUserManipulations) additionalUserManipulations(user);
            await user.save();
            return {};
        } catch (error) {
            return httpErrors.InternalServerError(error);
        }
    }

    /**
     * Does the login for a user
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {Promise<{models: User["Model"][]} | CustomError>}
     * @memberof Login
     */
    @Login.post("/", { public: true })
    async authenticate(request, response) {
        if (!request.body.email) return new CustomError("invalidEmail");
        if (!request.body.password) return new CustomError("invalidPassword");

        return new Promise((resolve, reject) => {
            passport.authenticate("local", (error, user) => {
                if (error) return reject(error);
                if (!user) return resolve(new CustomError("emailOrPasswordIncorrect"));
                request.logIn(user, (error) => {
                    if (error) {
                        console.error(error);
                        return response.send({ success: false, error });
                    }
                    const theUser = Object.assign({}, user.toObject());
                    delete theUser.hash;
                    delete theUser.salt;
                    resolve({ models: [theUser] });
                });
            })(request, response);
        });
    }
}
