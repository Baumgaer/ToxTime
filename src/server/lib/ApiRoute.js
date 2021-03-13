import DefaultRoute from "~server/lib/DefaultRoute";
import CustomError from "~common/lib/CustomError";
import { isMongoId, isArray, merge, isPlainObject, isValue } from "~common/utils";

import httpErrors from "http-errors";

export default class ApiRoute extends DefaultRoute {

    /** @type {ReturnType<typeof import("~server/lib/ServerModel")["default"]["buildServerExport"]>} */
    claimedExport = null;

    /**
     * collects all users and returns them in a list.
     *
     * @returns {Promise<import("~server/lib/ServerModel").default[] | Error>}
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
        return models || [];
    }

    /**
     * collects one user by its id if found
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<import("~server/lib/ServerModel").default | Error>}
     * @memberof Register
     */
    @ApiRoute.get("/:id")
    async getById(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        let model = null;
        try {
            model = await this.claimedExport.Model.findById(request.params.id).exec();
            if (!model) return new httpErrors.NotFound();
        } catch (error) {
            return error;
        }
        return model;
    }

    /**
     * creates a model depending on the claimed export model with the given
     * request body properties. The body will be cloned to be able to reflect
     * all given properties to the client (especially the dummyId). The creator
     * will also be assigned because every model is created by someone and it is
     * not possible to assign request.user as default in mongoose schema.
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @ApiRoute.post("/")
    async create(request) {
        if (!isPlainObject(request.body)) return new httpErrors.NotAcceptable();
        if (!("_dummyId" in request.body)) return new httpErrors.BadRequest();

        // Create a response body to reflect untouched properties (e.g. _dummyId)
        let responseBody = {};
        try {
            responseBody = JSON.parse(JSON.stringify(request.body));
        } catch (error) {
            return error;
        }

        try {
            const myRequestBody = await this.ProcessChildModels(request);
            if (myRequestBody instanceof Error) return myRequestBody;
            Object.assign(myRequestBody, { creator: request.user._id });
            delete myRequestBody._id;
            const model = await this.claimedExport.Model.create(myRequestBody);
            const modelObject = merge(responseBody, model.toObject());
            return modelObject;
        } catch (error) {
            return error;
        }
    }

    /**
     * Searches for references in the schema and request body and transforms all
     * appearing model objects in the request body to modelIds by creating this models.
     * In case any creation failed, all created models will be destroyed recursively
     * and the error is returned.
     *
     * @param {import("express").Request} request
     * @returns {Promise<import("express").Request["body"] | Error>}
     * @memberof ApiRoute
     */
    async ProcessChildModels(request) {
        const createdModels = [];
        const schemaObj = this.claimedExport.Schema.obj;
        const modelApiMapping = this.webServer.modelApiMapping;

        // Clone the body to ensure that other api routes does not manipulate this
        let myRequestBody = {};
        try {
            myRequestBody = JSON.parse(JSON.stringify(request.body));
        } catch (error) {
            return error;
        }

        for (const key in schemaObj) {
            if (!(key in myRequestBody)) continue;

            if (schemaObj[key].ref in modelApiMapping && isValue(myRequestBody[key]) && !isMongoId(myRequestBody[key])) {
                request.body = myRequestBody[key];
                let method = "create";
                if (request.body._id) {
                    method = "update";
                    request.params.id = request.body._id;
                    delete myRequestBody[key]._id;
                }
                try {
                    const result = await modelApiMapping[schemaObj[key].ref][method](request);
                    if (result instanceof Error) {
                        this.revertModelCreation(createdModels);
                        return result;
                    }
                    myRequestBody[key] = result._id;
                    createdModels.push(result);
                } catch (error) {
                    this.revertModelCreation(createdModels);
                    return error;
                }
            }

            if (isArray(schemaObj[key].type) && schemaObj[key].type[0].ref in modelApiMapping && isArray(myRequestBody[key])) {
                if (schemaObj[key].normalizeItems) await this.normalizeItems(request, key);
                for (const [index, childModel] of Object.entries(myRequestBody[key])) {
                    if (isMongoId(childModel)) continue;
                    request.body = childModel;
                    let method = "create";
                    if (request.body._id) {
                        method = "update";
                        request.params.id = request.body._id;
                        delete childModel._id;
                    }
                    try {
                        const result = await modelApiMapping[schemaObj[key].type[0].ref][method](request);
                        if (result instanceof Error) {
                            this.revertModelCreation(createdModels);
                            return result;
                        }
                        myRequestBody[key][index] = result._id;
                        createdModels.push(result);
                    } catch (error) {
                        this.revertModelCreation(createdModels);
                        return error;
                    }
                }
            }
        }

        return myRequestBody;
    }

    /**
     * Reverts the creation of models in case of an error
     *
     * @param {import("mongoose").Document[]} models
     * @memberof ApiRoute
     */
    async revertModelCreation(models) {
        const promises = [];
        for (const model of models) {
            let promise = model.delete();
            if (promise.exec) promise = promise.exec();
            promises.push(promise);
        }
        return Promise.all(promises);
    }

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @ApiRoute.patch("/:id")
    async update(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        if (!isPlainObject(request.body)) return new httpErrors.NotAcceptable();

        // Create a response body to reflect untouched properties (e.g. _dummyId)
        let responseBody = {};
        try {
            responseBody = JSON.parse(JSON.stringify(request.body));
        } catch (error) {
            return error;
        }

        try {
            const id = request.params.id;
            const myRequestBody = await this.ProcessChildModels(request);
            if (myRequestBody instanceof Error) return myRequestBody;
            Object.assign(request.body, { lastModified: new Date() });
            delete myRequestBody._id;
            let model = await this.claimedExport.Model.findByIdAndUpdate(id, myRequestBody).exec();
            if (!model) return new httpErrors.NotFound();
            model = await this.claimedExport.Model.findById(id).exec();
            const modelObject = merge(responseBody, model.toObject());
            return modelObject;
        } catch (error) {
            return error;
        }
    }

    /**
     * Removes items which are missing in the given array or deletes all items
     * when the owner of the array is deleted.
     *
     * @param {import("express").Request} request
     * @param {string} field
     * @param {"missing" | "all"} [mode="missing"]
     * @param {false | InstanceType<ReturnType<typeof import("~server/lib/ServerModel")["default"]["buildServerExport"]>["Model"]>}
     * @memberof ApiRoute
     */
    async normalizeItems(request, field, mode = "missing", useAsOld = false) {
        const iterable = request.body[field];
        const schemaObj = this.claimedExport.Schema.obj;
        const modelApiMapping = this.webServer.modelApiMapping;

        if (mode !== "all" && (!iterable || !isArray(iterable))) return;
        const oldModel = useAsOld || await this.claimedExport.Model.findById(request.params.id).exec();
        if (!oldModel) return;

        const filter = (model, idOrModelLike) => {
            if (!idOrModelLike) return false;
            const id = model._id.toString();
            return isMongoId(idOrModelLike) && idOrModelLike === id || idOrModelLike._id === id;
        };

        for (let index = 0; index < oldModel[field].length; index++) {
            const model = oldModel[field][index];

            let foundModel = false;
            if (mode === "missing") foundModel = Boolean(iterable.find((idOrModelLike) => filter(model, idOrModelLike)));

            if (!foundModel) {
                request.params.id = model._id.toString();
                await modelApiMapping[schemaObj[field].type[0].ref].delete(request);
            }
        }

        request.body[field] = request.body[field].filter((item) => Boolean(item));
    }

    /**
     * Deletes a model by the given id and returns the old result if model was found
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @ApiRoute.delete("/:id")
    async delete(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        const schemaObj = this.claimedExport.Schema.obj;

        try {
            const result = await this.claimedExport.Model.findByIdAndDelete(request.params.id).exec();
            if (!result) return new httpErrors.NotFound();
            for (const key in schemaObj) {
                if (!schemaObj[key].normalizeItems) continue;
                await this.normalizeItems(request, key, "all", result);
            }
            return result;
        } catch (error) {
            return error;
        }
    }
}
