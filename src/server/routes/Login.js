import passport from "passport";
import DefaultRoute from "~server/lib/DefaultRoute";

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
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Login
     */
    routeGetTest(request, response) {
        response.send({
            lng: request.language,
            trans: request.t("hello")
        });
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
