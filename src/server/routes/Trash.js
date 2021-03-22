import DefaultRoute from "~server/lib/DefaultRoute";
import { flatten } from "~common/utils";

export default class Trash extends DefaultRoute {

    /**
     * Sends the initial file when not logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {string}
     * @memberof Public
     */
    @Trash.get("/")
    async getAll() {
        const promises = [];
        for (const modelExport of Object.values(global._modelMap)) {
            promises.push(modelExport.Model.find({ deleted: true }).exec());
        }

        return flatten([].concat((await Promise.all(promises))));
    }
}
