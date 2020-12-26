import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";
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
    async routeGet8username8email8password8matr(request, response) {
        const user = new User({
            username: request.params.username,
            email: request.params.email,
            password: request.params.password,
            matriculationNumber: request.params.matr
        });

        await User.register(user, request.params.password, (err) => {
            if (err) {
                response.send({
                    success: false, message: "Your account could not be saved. Error: ", err
                });
            } else {
                response.json({
                    success: true, message: "Your account has been saved"
                });
            }
        });
    }
}
