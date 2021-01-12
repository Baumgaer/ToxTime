import DefaultRoute from "~server/lib/DefaultRoute";
import User from "~server/models/User";
import httpErrors from "http-errors";
import { isMongoId } from "validator";
import CustomError from "~common/lib/CustomError";
import { connection } from "mongoose";

export default class Logout extends DefaultRoute {

    /**
     * Ends the session of the current user and redirects to index page
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Logout
     */
    @Logout.get("/", { public: true })
    async logout(request, response) {
        await request.logOut();
        response.redirect("/");
    }

    /**
     * Ends the session of a specific user
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {void}
     * @memberof Logout
     */
    @Logout.get("/:id")
    async kickUser(request, response) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        try {
            const result = await User.Model.findById(request.params.id).exec();
            if (!result) return httpErrors.NotFound();
            if (String(result._id).valueOf() === String(request.user._id).valueOf()) return this.logout(request, response);
            await connection.db.collection("sessions").findOneAndDelete({ "session.passport.user": result.email });
            return {};
        } catch (error) {
            return error;
        }
    }


}
