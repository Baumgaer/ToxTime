import DefaultRoute from "~server/lib/DefaultRoute";
import CustomError from "~common/lib/CustomError";
import httpErrors from "http-errors";
import { isMongoId } from "validator";
import { isArray } from "lodash";

/** @type {Record<string, ReturnType<import("~server/lib/ServerModel")["default"]["buildServerExport"]>>} */
const modelExportMap = {};
export default class ApiRoute extends DefaultRoute {

    /** @type {ReturnType<typeof import("~server/lib/ServerModel")["default"]["buildServerExport"]>} */
    claimedExport = null;

    constructor() {
        super();
        const modelContext = require.context("~server/models", true, /[A-Za-z0-9-_,\s]+\.js$/i, "sync");
        modelContext.keys().forEach((key) => {
            /** @type {ReturnType<import("~server/lib/ServerModel")["default"]["buildServerExport"]>} */
            const modelExport = modelContext(key).default;
            modelExportMap[modelExport.Model.className] = modelExport;
        });
    }
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
            if (!model) return httpErrors.NotFound();
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
            return await this.createRecursive(request, this.claimedExport.Model.className, request.body, {}, true);
        } catch (error) {
            return error;
        }
    }

    /**
     * Creates all model references recursive, when a new model should be created
     *
     * @param {import("express").Request} request the request
     * @param {string} modelName The name of the current model
     * @param {Record<string, any>} modelBody The raw data of the model
     * @param {Record<string, any>} returnBody TThe body which will be returned to the client
     * @param {boolean} returnTheReturnBody Wether the returnBody should be returned or the original result
     * @returns {string}
     * @memberof ApiRoute
     */
    async createRecursive(request, modelName, modelBody, returnBody = {}, returnTheReturnBody = false) {
        const schemaObject = modelExportMap[modelName].Schema.obj;
        for (const key in schemaObject) {
            if (key in modelBody) {
                if (schemaObject[key].ref) {
                    // If this is already a mongo id, we don't have to process an "object"
                    if (isMongoId(modelBody[key])) continue;

                    // prepare empty return body fur sub model which will be returned to client
                    const subReturnBody = {};
                    returnBody[key] = subReturnBody;

                    const result = await this.createRecursive(request, schemaObject[key].ref, modelBody[key], subReturnBody);
                    if (result instanceof Error) return result;

                    // Set the ID for model reference to be able to create the parent model
                    modelBody[key] = result.models[0]._id;
                }
                if (isArray(schemaObject[key].type) && schemaObject[key].type[0].ref && isArray(modelBody[key])) {
                    for (const [index, subModelBody] of Object.entries(modelBody[key])) {

                        // prepare empty return body fur sub model which will be returned to client
                        const subReturnBody = {};
                        if (!returnBody[key]) returnBody[key] = [];
                        returnBody[key][index] = subReturnBody;

                        // If this is already a mongo id, we don't have to process an "object"
                        // but we need to insert the ID to hold the index and structure of the update response
                        if (isMongoId(subModelBody)) {
                            returnBody[key][index] = subModelBody;
                            continue;
                        }

                        const result = await this.createRecursive(request, schemaObject[key].type[0].ref, subModelBody, subReturnBody);
                        if (result instanceof Error) return result;

                        // Set the ID for model reference to be able to create the parent model
                        modelBody[key][index] = result.models[0]._id;
                    }
                }
            }
        }
        const result = await this.doCreate(request, modelName, modelBody);
        if (!returnTheReturnBody) {
            if (!(result instanceof Error)) Object.assign(returnBody, result.models[0]);
            return result;
        }
        if (!(result instanceof Error)) Object.assign(result.models[0], returnBody);
        return result;
    }

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {string}
     * @memberof ApiRoute
     */
    async doCreate(request, modelName, body) {
        try {
            Object.assign(body, { creator: request.user._id });
            const model = await modelExportMap[modelName].Model.create(body);
            const modelObject = Object.assign({}, model.toObject(), { _dummyId: body._dummyId || request.header("X-DUMMY-MODEL-ID") });
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
    async update(request) {
        try {
            Object.assign(request.body, { lastModified: new Date() });
            const result = await this.claimedExport.Model.findByIdAndUpdate(request.params.id, request.body).exec();
            if (!result) return httpErrors.NotFound();
            return { models: [] };
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
            return { models: [result] };
        } catch (error) {
            return error;
        }
    }
}
