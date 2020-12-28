import passport from "passport";
import DefaultRoute from "~server/lib/DefaultRoute";

export default class Login extends DefaultRoute {

    constructor(mainApp, subApp) {
        super(mainApp, subApp);
        this.routerNameSpace = "/login";
    }

    /**
     * test
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Login
     */
    async routeGet8email8password(request, response) {
        if (!request.params.email) return response.send({});
        if (!request.params.password) return response.send({});
        request.body = request.params;
        passport.authenticate("local", (error, user) => {
            if (error) return response.send({ success: false, error });
            if (!user) return response.send({ success: false, error: { name: "emailOrPasswordIncorrect" } });
            request.logIn(user, (error) => {
                if (error) return response.send({ success: false, error });
                response.send({ success: true });
            });
        })(request, response);
    }
}
