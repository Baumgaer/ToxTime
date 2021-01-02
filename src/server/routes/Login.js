import passport from "passport";
import httpErrors from "http-errors";
import { isEmail } from "validator";
import { v4 as uuIDv4 } from "uuid";
import DefaultRoute from "~server/lib/DefaultRoute";
import EmailTransporter from "~server/lib/EmailTransporter";
import User from "~server/models/User";
import { isUUID } from "validator";

export default class Login extends DefaultRoute {

    constructor(mainApp, parentApp) {
        super(mainApp, parentApp);
        this.routerNameSpace = "/login";
        this.routeOf = ["/"];
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Login
     */
    async routeGet(request, response) {
        response.redirect("/");
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
    routeGetReset(request, response, next) {
        this.parentApp.sendStaticFile(request, response, next, true);
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
    async routePostReset(request, response, next) {
        const email = request.body.email;
        if (!isEmail(email)) return response.send({ success: false, error: { name: "emailIncorrect" } });
        const emailTransporter = EmailTransporter.getInstance();
        try {
            const user = await User.findOne({ email }).exec();
            if (user) {
                const token = uuIDv4();
                user.passwordResetToken = token;
                await user.save();
                await emailTransporter.send(request, {
                    to: email,
                    subject: "resetPassword",
                    locales: {
                        url: `http://${process.env.domain || "localhost"}/login/reset/${token}`,
                        user: user
                    }
                });
            }
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
        if (!token || !isUUID(token, "4")) return next(httpErrors.NotAcceptable());
        const user = await User.findOne({ passwordResetToken: token }).exec();
        if (!user) return next(httpErrors.NotFound());
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
    async routeGetReset8token(request, response, next) {
        await this.checkPasswordResetToken(request, response, next);
        this.sendStaticFile(response);
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
    async routePostReset8token(request, response, next) {
        const password = request.body.password;
        const repeatPassword = request.body.repeatPassword;
        if (!passport) return response.send({ success: false, error: { name: "passwordNotFilled", field: "password" } });
        if (!repeatPassword) return response.send({ success: false, error: { name: "passwordNotFilled", field: "repeatPassword" } });
        if (password !== repeatPassword) return response.send({ success: false, error: { name: "passwordsNotEqual", field: "repeatPassword" } });
        const user = await this.checkPasswordResetToken(request, response, next);
        user.passwordResetToken = "";
        try {
            await user.setPassword(password);
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
    async routePost(request, response) {
        if (!request.body.email) return response.send({ success: false, error: { name: "invalidEmail" } });
        if (!request.body.password) return response.send({ success: false, error: { name: "invalidPassword" } });

        passport.authenticate("local", (error, user) => {
            if (error) return response.send({ success: false, error });
            if (!user) return response.send({ success: false, error: { name: "emailOrPasswordIncorrect" } });
            request.logIn(user, (error) => {
                if (error) return response.send({ success: false, error });
                const theUser = Object.assign({}, user)._doc;
                delete theUser.salt;
                delete theUser.hash;

                response.send({ success: true, data: { models: [theUser] } });
            });
        })(request, response);
    }
}
