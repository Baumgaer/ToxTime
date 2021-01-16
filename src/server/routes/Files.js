import ApiRoute from "~server/lib/ApiRoute";
import File from "~server/models/File";
//import CustomError from "~common/lib/CustomError";
// import { v4 as uuid } from "uuid";
// import { isMongoId } from "validator";
import httpErrors from "http-errors";
import path from "path";
import arp from "app-root-path";
import lodash from "lodash";
import fs from "graceful-fs";

export default class Files extends ApiRoute {

    claimedExport = File;

    /**
     * TEST
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {Promise<{models: [User["Model"]]} | Error>}
     * @memberof Files
     */
    @Files.get("/:id", { allowUser: true })
    async getById(request, response) {
        const result = await super.getById(request);
        if (result instanceof Error) return result;
        const model = result.models[0];
        if (!model) return httpErrors.NotFound();
        return new Promise((resolve, reject) => {
            response.sendFile(path.resolve(arp.path, "uploads", model.fileName), (error) => {
                if (error) reject(error);
                resolve();
            });
        });
    }

    /**
     * Sends the initial file when logged in.
     *
     * @param {import("express").Request} request the request
     * @returns {string}
     * @memberof Files
     */
    @Files.post("/")
    async create(request) {
        if (!request.files || Object.keys(request.files).length === 0 || !lodash.isPlainObject(request.files)) return httpErrors.BadRequest();

        for (const fileNameField in request.files) {
            if (Object.hasOwnProperty.call(request.files, fileNameField)) {
                const file = request.files[fileNameField];
                let fileName = `${file.md5}${path.extname(file.name)}`;
                let filePath = path.resolve(arp.path, "uploads", fileName);
                if (fs.existsSync(filePath)) return httpErrors.Conflict();
                try {
                    await file.mv(filePath);
                    request.body = { name: file.name, mime: file.mimetype, fileName: fileName, size: file.size, uploader: request.user._id };
                    try {
                        return await super.create(request);
                    } catch (error) {
                        try {
                            fs.unlinkSync(filePath);
                            return error;
                        } catch (error) {
                            return error;
                        }
                    }
                } catch (error) {
                    return error;
                }
            }
        }
    }

    @Files.delete("/:id")
    async delete(request) {
        const result = await super.delete(request);
        if (result instanceof Error) return result;
        const model = result.models[0];
        try {
            fs.unlinkSync(path.resolve(arp.path, "uploads", model.fileName));
            return result;
        } catch (error) {
            return error;
        }
    }
}
