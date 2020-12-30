import passport from "passport";
import httpErrors from "http-errors";
import { isEmail } from "validator";
import { v4 as uuIDv4 } from "uuid";
import DefaultRoute from "~server/lib/DefaultRoute";
import EmailTransporter from "~server/lib/EmailTransporter";
import User from "~server/models/User";

export default class Login extends DefaultRoute {

    constructor(mainApp, subApp) {
        super(mainApp, subApp);
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
    routeGet(_request, response) {
        response.redirect("/");
    }

    /**
     * test
     *
     * @param {import("express").Request} _request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Login
     */
    routeGetReset(_request, response) {
        this.sendStaticFile(response);
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @param {import("express").NextFunction} response the next middleware
     * @returns {void}
     * @memberof Login
     */
    async routePostReset(request, response, next) {
        const email = request.body.email;
        if (!isEmail(email)) return response.send({ success: false, error: { name: "emailIncorrect" } });
        const emailTransporter = EmailTransporter.getInstance();
        try {
            const user = await User.findOne({ email });
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
