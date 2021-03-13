import ApiRoute from "~server/lib/ApiRoute";
import Item from "~server/models/Item";

export default class Items extends ApiRoute {

    claimedExport = Item;

    /**
     * Uses the default create function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @Items.post("/", { allowUser: true })
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
    @Items.patch("/:id", { allowUser: true })
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
    @Items.delete("/:id", { allowUser: true })
    async delete(request) {
        return await super.delete(request);
    }

}
