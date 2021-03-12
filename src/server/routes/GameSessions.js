import ApiRoute from "~server/lib/ApiRoute";
import GameSession from "~server/models/GameSession";

export default class GameSessions extends ApiRoute {

    claimedExport = GameSession;

    /**
     * Uses the default create function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.post("/", { allowUser: true })
    async create(request) {
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
        return await super.delete(request);
    }

}
