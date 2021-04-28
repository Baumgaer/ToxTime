import { Forbidden } from "http-errors";
import ApiRoute from "~server/lib/ApiRoute";
import GameSession from "~server/models/GameSession";
import User from "~server/models/User";

export default class GameSessions extends ApiRoute {

    claimedExport = GameSession;

    async isAllowed(request) {
        const id = request.params.id;
        const filter = (session) => session?._id.toString() === id || session === id;

        // In case of the user is edited
        let gameSessionOwner = request.object;

        // In case of the game session is edited
        if (request.object instanceof GameSession.Model) gameSessionOwner = request.object.creator;

        if (request.user._id?.toString() !== gameSessionOwner._id?.toString() && !request.user.isAdmin) return false;
        if (!gameSessionOwner.populated("currentGameSessions") && !gameSessionOwner.populated("solvedGameSessions")) {
            gameSessionOwner = await User.Model.findById(gameSessionOwner._id.toString()).exec();
        }
        return Boolean(gameSessionOwner.currentGameSessions.find(filter) || gameSessionOwner.solvedGameSessions.find(filter));
    }

    /**
     * Uses the default create function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.post("/", { allowUser: true })
    async create(request) {
        const filter = (session) => {
            const storedLessonId = session?.lesson?._id.toString();
            if (!storedLessonId) return true;
            return storedLessonId === request.body.lesson || storedLessonId === request.body.lesson._id;
        };
        if (!request.body.lesson || request.user.currentGameSessions.find(filter) || request.user.solvedGameSessions.find(filter)) return new Forbidden();
        return await super.create(request);
    }

    /**
     * Uses the default update function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.patch("/:id", { allowUser: true })
    async update(request) {
        if (!await this.isAllowed(request)) return new Forbidden();
        return await super.update(request);
    }

    /**
     * Uses the default delete function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.delete("/:id", { allowUser: true })
    async delete(request) {
        if (!await this.isAllowed(request)) return new Forbidden();
        return await super.delete(request);
    }

}
