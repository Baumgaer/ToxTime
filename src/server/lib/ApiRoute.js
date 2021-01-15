import DefaultRoute from "~server/lib/DefaultRoute";
import CustomError from "~common/lib/CustomError";
import httpErrors from "http-errors";
import { isMongoId } from "validator";

export default class ApiRoute extends DefaultRoute {

    /** @type {ReturnType<typeof import("~server/lib/ServerModel")["default"]["buildServerExport"]>} */
    claimedExport = null;

    /**
     * collects all users and returns them in a list.
     *
     * @returns {Promise<{models: User["Model][]} | Error>}
     * @memberof Register
     */
    @ApiRoute.get("/")
    async getAll() {
        let models = null;
        try {
            models = await this.claimedExport.Model.find({}).exec();
        } catch (error) {
            return error;
        }
        return { models: models || [] };
    }

    /**
     * collects one user by its id if found
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<{models: [User["Model"]]} | Error>}
     * @memberof Register
     */
    @ApiRoute.get("/:id")
    async getById(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        let model = null;
        try {
            model = await this.claimedExport.Model.findById(request.params.id).exec();
        } catch (error) {
            return error;
        }
        return { models: [model] };
    }

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {string}
     * @memberof ApiRoute
     */
    @ApiRoute.post("/")
    async create(request) {
        try {
            const model = await this.claimedExport.Model.create(request.body);
            const dummyModelId = request.header("X-DUMMY-MODEL-ID");
            const modelObject = Object.assign({}, model.toObject(), { _dummyId: dummyModelId || "" });
            return { models: [modelObject] };
        } catch (error) {
            return error;
        }
    }

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {string}
     * @memberof ApiRoute
     */
    @ApiRoute.patch("/:id")
    update(request) {
        try {
            return this.claimedExport.Model.findByIdAndUpdate(request.params.id, request.body);
        } catch (error) {
            return error;
        }
    }

    @ApiRoute.delete("/:id")
    async delete(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        try {
            const result = await this.claimedExport.Model.findByIdAndDelete(request.params.id).exec();
            if (!result) return httpErrors.NotFound();
            return {};
        } catch (error) {
            return error;
        }
    }
}
