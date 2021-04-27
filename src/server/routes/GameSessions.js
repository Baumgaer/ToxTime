import { Forbidden } from "http-errors";
import ApiRoute from "~server/lib/ApiRoute";
import GameSession from "~server/models/GameSession";

export default class GameSessions extends ApiRoute {

    claimedExport = GameSession;

    isAllowed(request) {
        const id = request.params.id;
        const filter = (session) => session?._id.toString() === id || session === id;
        return Boolean(request.user.currentGameSessions.find(filter) || request.user.solvedGameSessions.find(filter));
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
        if (!this.isAllowed(request)) return new Forbidden();
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
        if (!this.isAllowed(request)) return new Forbidden();
        return await super.delete(request);
    }

}
