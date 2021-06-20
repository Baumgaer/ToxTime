import DefaultRoute from "~server/lib/DefaultRoute";
import { cloneDeep, isArray, isMongoId } from "~common/utils";
import httpErrors from "http-errors";

export default class Batch extends DefaultRoute {

    /**
     * Sends the initial file when not logged in.
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {string}
     * @memberof Batch
     */
    @Batch.all("/:action")
    async action(request) {
        const myRequestBody = cloneDeep(request.body);
        const allowedActions = ["logout", "toggleLock", "resentConfirm", "delete", "copy", "download", "restore"];
        const modelApiMapping = this.webServer.modelApiMapping;
        const isAllowed = allowedActions.includes(request.params.action);
        const hasValidBody = myRequestBody.identities && isArray(myRequestBody.identities);
        const allIdsAreValid = myRequestBody.identities.every((identity) => {
            return isMongoId(identity._id) && identity.className in modelApiMapping;
        });

        if (!isAllowed || !hasValidBody || !allIdsAreValid) return new httpErrors.Forbidden();

        const getObjectPromises = [];
        for (const identity of myRequestBody.identities) {
            getObjectPromises.push(global._modelMap[identity.className].Model.findById(identity._id).exec());
        }

        const models = await Promise.all(getObjectPromises);
        const responsePromises = [];
        for (let index = 0; index < models.length; index++) {
            const model = models[index];
            if (!model) continue;
            request.params.id = model._id.toString();
            request.object = model;
            responsePromises.push(modelApiMapping[model._getClassName()][request.params.action](request));
        }

        return await Promise.all(responsePromises);
    }
}
