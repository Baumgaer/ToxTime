import ApiRoute from "~server/lib/ApiRoute";
import Requisite from "~server/models/Requisite";
import { isMongoId, isPlainObject, merge } from "~common/utils";
import { readFileSync, unlinkSync, copyFileSync } from "graceful-fs";
import { path as rootPath } from "app-root-path";
import { resolve, dirname } from "path";
import { sync as createDirSync } from "mkdirp";
import CustomError from "~common/lib/CustomError";
import httpErrors from "http-errors";
import { v4 as uuid } from "uuid";

export default class Requisites extends ApiRoute {

    claimedExport = Requisite;

    /**
     * Writes an svg file with given id as file name and request.body.content
     * as file content
     *
     * @param {import("express").Request} request the request
     * @returns {boolean}
     * @memberof Requisites
     */
    @Requisites.put("/:id")
    async createAvatar(request) {
        if (!isMongoId(request.params.id) || !request.files || Object.keys(request.files).length === 0 || !isPlainObject(request.files)) return false;
        const exists = await this.claimedExport.Model.findById(request.params.id).countDocuments().exec();
        if (!exists) return false;

        const path = resolve(rootPath, "avatars", `${request.params.id}.png`);
        createDirSync(dirname(path));
        for (const fileNameField in request.files) {
            if (Object.hasOwnProperty.call(request.files, fileNameField)) {
                const file = request.files[fileNameField];
                try {
                    await file.mv(path);
                    return true;
                } catch (error) {
                    return error;
                }
            }
        }
        return true;
    }

    /**
     * Returns the svg avatar if found
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {false | string | number>}
     * @memberof Requisites
     */
    @Requisites.get("/:id/avatar", { allowUser: true })
    getAvatar(request, response) {
        if (this.isFresh(request, response)) return 304;
        if (!isMongoId(request.params.id)) return false;
        try {
            return readFileSync(resolve(rootPath, "avatars", `${request.params.id}.png`));
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    @Requisites.post("/copy/:id")
    async copy(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");

        const result = await this.claimedExport.Model.findById(request.params.id).exec();
        if (!result) return new httpErrors.NotFound();
        const plainObj = result.toObject();
        delete plainObj._id;
        plainObj._dummyId = uuid();

        for (const clickArea of plainObj.clickAreas) {
            delete clickArea._id;
            clickArea._dummyId = uuid();
        }

        for (const actionObject of plainObj.actionObjects) {
            delete actionObject._id;
            actionObject._dummyId = uuid();
            actionObject.sceneObject = actionObject.sceneObject._id;
        }

        merge(plainObj, request.body || {});
        request.body = plainObj;

        const copy = await this.create(request);
        if (copy instanceof Error) return copy;

        try {
            copyFileSync(resolve(rootPath, "avatars", `${result._id.toString()}.png`), resolve(rootPath, "avatars", `${copy._id.toString()}.png`));
        } catch (error) {
            console.error(error);
        }

        return copy;
    }

    /**
     * Removes not only the requisite itself by calling the general delete function,
     * but also all clickAreas and actionObjects associated with this object
     *
     * @param {import("express").Request} request the request
     * @returns {void}
     * @memberof Requisites
     */
    @Requisites.delete("/:id")
    async delete(request) {
        const result = await super.delete(request);

        // We do not want to delete the avatar in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        if (result.deleted) return result;

        try {
            unlinkSync(resolve(rootPath, "avatars", `${request.params.id}.png`));
        } catch (error) {
            // Not interested in stopping progress on failed avatar deletion...
            // It's may be not existent
            console.error(error);
        }

        return result;
    }

}
