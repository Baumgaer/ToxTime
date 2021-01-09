import passport from "passport";
import httpErrors from "http-errors";
import { isEmail } from "validator";
import { v4 as uuIDv4 } from "uuid";
import DefaultRoute from "~server/lib/DefaultRoute";
import EmailTransporter from "~server/lib/EmailTransporter";
import User from "~server/models/User";
import { isUUID } from "validator";
import normalizeURL from "normalize-url";

export default class Login extends DefaultRoute {
    /**
     * test
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
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Login
     */
    @Login.get("/reset", { public: true })
    sendLoginFile(request, response) {
        this.renderPage(request, response, "index");
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @param {import("express").NextFunction} next the next middleware
     * @returns {void}
     * @memberof Login
     */
    @Login.post("/reset", { public: true })
    async requestPasswordReset(request, response, next) {
        const email = request.body.email;
        if (!isEmail(email)) return response.send({ success: false, error: { name: "emailIncorrect" } });
        const emailTransporter = EmailTransporter.getInstance();
        try {
            const user = await User.findOne({ email }).exec();
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
            response.send({ success: true, data: {} });
        } catch (error) {
            next(httpErrors.InternalServerError(error));
        }
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} _response the response
     * @param {import("express").NextFunction} next the next middleware
     * @returns {void}
     * @memberof Login
     */
    async checkPasswordResetToken(request, _response, next) {
        const token = request.params.token;
        if (!token || !isUUID(token, "4")) {
            next(httpErrors.NotAcceptable());
            return null;
        }
        const user = await User.findOne({ passwordResetToken: token }).exec();
        if (!user) {
            next(httpErrors.NotFound());
            return null;
        }
        return user;
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @param {import("express").NextFunction} next the next middleware
     * @returns {void}
     * @memberof Login
     */
    @Login.get("/reset/:token", { public: true })
    async renderPasswordResetPage(request, response, next) {
        const result = await this.checkPasswordResetToken(request, response, next);
        if (!result) return;
        this.renderPage(request, response, "index");
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @param {import("express").NextFunction} next the next middleware
     * @returns {void}
     * @memberof Login
     */
    @Login.post("/reset/:token", { public: true })
    async resetPassword(request, response, next) {
        const password = request.body.password;
        const repeatPassword = request.body.repeatPassword;
        if (!passport) return response.send({ success: false, error: { name: "passwordNotFilled", field: "password" } });
        if (!repeatPassword) return response.send({ success: false, error: { name: "passwordNotFilled", field: "repeatPassword" } });
        if (password !== repeatPassword) return response.send({ success: false, error: { name: "passwordsNotEqual", field: "repeatPassword" } });
        const user = await this.checkPasswordResetToken(request, response, next);
        try {
            await user.setPassword(password);
            user.passwordResetToken = undefined;
            await user.save();
            response.send({ success: true, data: {} });
        } catch (error) {
            next(httpErrors.InternalServerError(error));
        }
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Login
     */
    @Login.post("/", { public: true })
    async authenticate(request, response) {
        if (!request.body.email) return response.send({ success: false, error: { name: "invalidEmail" } });
        if (!request.body.password) return response.send({ success: false, error: { name: "invalidPassword" } });

        passport.authenticate("local", (error, user) => {
            if (error) return response.send({ success: false, error });
            if (!user) return response.send({ success: false, error: { name: "emailOrPasswordIncorrect" } });
            request.logIn(user, (error) => {
                if (error) return response.send({ success: false, error });
                const theUser = Object.assign({}, user.toObject());
                delete theUser.hash;
                delete theUser.salt;
                response.send({ success: true, data: { models: [theUser] } });
            });
        })(request, response);
    }
}
