import DefaultRoute from "~server/lib/DefaultRoute";
import CustomError from "~common/lib/CustomError";
import { isMongoId, isArray, merge, isPlainObject, isValue, get, set, eachDeep } from "~common/utils";
import { v4 as uuid } from "uuid";

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
                request.body = myRequestBody;
                if (schemaObj[key].dependant) await this.normalizeItems(request, key);
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
            const modelApiMapping = this.webServer.modelApiMapping;
            const myRequestBody = await this.ProcessChildModels(request);
            if (myRequestBody instanceof Error) return myRequestBody;
            Object.assign(myRequestBody, { lastModifiedDate: new Date() });
            delete myRequestBody._id;

            let model = await this.claimedExport.Model.findByIdAndUpdate(id, myRequestBody).exec();
            if (!model) return new httpErrors.NotFound();

            // Delete all sticky referenced but deleted models which have lost
            // their last reference by editing this model
            const stickyReferencedDeletedModels = await model.getStickyReferencedDeletedModels();
            for (const stickyReferencedDeletedModel of stickyReferencedDeletedModels) {
                const stickyReferencingModels = await stickyReferencedDeletedModel.getStickyReferencingModels();
                if (!stickyReferencingModels.length || stickyReferencingModels.length === 1 && stickyReferencingModels[0] === model) {
                    request.params.id = stickyReferencedDeletedModel._id.toString();
                    await modelApiMapping[stickyReferencedDeletedModel._getClassName()].delete(request);
                }
            }

            // Get new updated version of the model
            model = await this.claimedExport.Model.findById(id).exec();
            const modelObject = merge(responseBody, model.toObject());
            return modelObject;
        } catch (error) {
            console.error(error);
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
        const id = request.params.id;
        const myRequestBody = request.body;
        let iterable = myRequestBody[field];
        const schemaObj = this.claimedExport.Schema.obj;
        const modelApiMapping = this.webServer.modelApiMapping;

        if (mode !== "all" && (!iterable || !isArray(iterable))) return;
        const oldModel = useAsOld || await this.claimedExport.Model.findById(id).exec();
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
                const result = await modelApiMapping[schemaObj[field].type[0].ref].delete(request);
                if (!result || result instanceof Error || !result.deleted) continue;
                const resultId = result._id.toString();
                if (mode === "missing" && !iterable.some((item) => item === resultId || item._id === resultId)) iterable.push(resultId);
            }
        }
        if (mode === "missing") myRequestBody[field] = iterable.filter?.((item) => Boolean(item));
    }

    async markDependentsOfModelWith(model, callback) {
        const dependantModels = await model.getDependantReferencedModels();
        for (const dependantModel of dependantModels) {
            await this.markDependentsOfModelWith(dependantModel, callback.bind(this));
            await callback(dependantModel);
            await dependantModel.save();
        }
    }

    async somehowStickyReferenced(model) {
        return model.isStickyReferenced() && (await model.getStickyReferencingModels()).length || await this.someDependentsAreStickyReferenced(model);
    }

    async someDependentsAreStickyReferenced(model) {
        const dependantModels = await model.getDependantReferencedModels();
        for (const dependantModel of dependantModels) {
            if (await this.somehowStickyReferenced(dependantModel)) return true;
        }
        return false;
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
            const model = await this.claimedExport.Model.findById(request.params.id).exec();
            if (!model) return new httpErrors.NotFound();

            // Check if model is sticky used by at least one other model
            // If yes, just mark it as deleted but do not delete it really.
            // Do the same for all direct dependant models
            if (await this.somehowStickyReferenced(model)) {
                await this.markDependentsOfModelWith(model, (dependant) => { dependant.deleted = true; });
                model.deleted = true;
                await model.save();
                return model;
            }

            // model is not sticky used by another model. So unmark pseudo
            // deletion and delete it finally
            await this.markDependentsOfModelWith(model, (dependant) => { dependant.deleted = false; dependant.wasted = true; });
            model.deleted = false;
            model.wasted = true;
            let returnRequested = false;
            if (!request.requestedModel) {
                returnRequested = true;
                request.requestedModel = JSON.parse(JSON.stringify(model));
            }
            await model.remove();

            // Delete all dependant models
            for (const key in schemaObj) {
                if (!schemaObj[key].dependant) continue;
                await this.normalizeItems(request, key, "all", model);
            }

            // If there is at least one model, which is sticky used by this model but deleted
            // try to delete it finally. It will do it's dependency checks itself
            const stickyReferencedDeletedModels = await model.getStickyReferencedDeletedModels();
            for (const stickyReferencedDeletedModel of stickyReferencedDeletedModels) {
                request.params.id = stickyReferencedDeletedModel._id.toString();
                const result = await this.webServer.modelApiMapping[stickyReferencedDeletedModel._getClassName()].delete(request);
                if (request.requestedModel) {
                    let currentModelResult = null;
                    eachDeep(request.requestedModel, (value, key, parentValue, context) => {
                        if (value === result._id.toString()) {
                            currentModelResult = parentValue;
                            context.break();
                        }
                    });
                    if (currentModelResult) {
                        currentModelResult.wasted = result.wasted;
                        currentModelResult.deleted = result.deleted;
                    }
                }
            }
            if (returnRequested) return request.requestedModel;
            return model;
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    /**
     * Deletes a model by the given id and returns the old result if model was found
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @ApiRoute.patch("/restore/:id")
    async restore(request) {
        try {
            const model = await this.claimedExport.Model.findById(request.params.id).exec();
            if (!model) return new httpErrors.NotFound();

            await this.markDependentsOfModelWith(model, (dependant) => {
                dependant.deleted = false;
            });
            model.deleted = false;
            await model.save();
            return model;
        } catch (error) {
            return error;
        }
    }

    /**
     * Deletes a model by the given id and returns the old result if model was found
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @ApiRoute.post("/copy/:id")
    async copy(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        if (request.body && !isPlainObject(request.body)) return new httpErrors.NotAcceptable();

        /** @type {null | import("~server/lib/ServerModel").default} */
        const result = await this.claimedExport.Model.findById(request.params.id).exec();
        if (!result) return new httpErrors.NotFound();

        const plainObj = result.toObject();
        delete plainObj._id;
        plainObj._dummyId = uuid();

        const processSticky = (referencePath) => {
            const references = get(plainObj, referencePath);
            if (isArray(references)) {
                set(plainObj, referencePath, references.map((reference) => reference._id.toString()));
            } else if (isPlainObject(references)) set(plainObj, referencePath, references._id.toString());
        };

        const processReferencesOfDirectReference = (referencePath, concatValue) => {
            referencePath = referencePath.concat(concatValue);
            const modelClass = get(result, referencePath);
            if (!modelClass) return;
            const referenceModelExports = modelClass.getReferenceModelExports();

            for (const referenceModelExport of referenceModelExports) {
                const referenceReferencePaths = modelClass.getReferencePathsOf(referenceModelExport.RawClass.className);
                for (const referenceReferencePath of referenceReferencePaths) {
                    processSticky(referencePath.concat(referenceReferencePath));
                }
            }
        };

        const processDependant = (referencePath) => {
            const references = get(plainObj, referencePath);
            if (isArray(references)) {
                for (let i = 0; i < references.length; i++) {
                    const reference = references[i];
                    delete reference._id;
                    reference._dummyId = uuid();
                    processReferencesOfDirectReference(referencePath, [i]);
                }
            } else if (isPlainObject(references)) {
                delete references._id;
                references._dummyId = uuid();
                processReferencesOfDirectReference(referencePath, []);
            }
        };

        const referenceModelExports = result.getReferenceModelExports();
        for (const referenceModelExport of referenceModelExports) {
            const referencePaths = result.getReferencePathsOf(referenceModelExport.RawClass.className);
            for (const referencePath of referencePaths) {
                const referenceDeclaration = get(result.getSchemaObject(), referencePath);
                if (referenceDeclaration.sticky) processSticky(referencePath);
                if (referenceDeclaration.dependant) processDependant(referencePath);
            }
        }

        merge(plainObj, request.body || {});
        request.body = plainObj;
        request.params.id = null;
        return this.create(request);
    }
}
