import ApiRoute from "~server/lib/ApiRoute";
import File from "~server/models/File";
import httpErrors from "http-errors";
import path from "path";
import arp from "app-root-path";
import { isPlainObject } from "~common/utils";
import fs from "graceful-fs";

export default class Files extends ApiRoute {

    claimedExport = File;

    /**
     * TEST
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {Promise<{User["Model"]} | Error>}
     * @memberof Files
     */
    @Files.get("/:id/avatar", { allowUser: true })
    async getAvatarById(request, response) {
        if (this.isFresh(request, response)) return 304;
        const result = await super.getById(request);
        if (result instanceof Error) return result;
        const model = result;
        if (!model) return httpErrors.NotFound();
        return fs.readFileSync(path.resolve(arp.path, "uploads", model.fileName));
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
        if (!request.files || Object.keys(request.files).length === 0 || !isPlainObject(request.files)) return httpErrors.BadRequest();

        for (const fileNameField in request.files) {
            if (Object.hasOwnProperty.call(request.files, fileNameField)) {
                const file = request.files[fileNameField];
                let fileName = `${file.md5}${path.extname(file.name)}`;
                let filePath = path.resolve(arp.path, "uploads", fileName);
                if (fs.existsSync(filePath)) return httpErrors.Conflict();
                try {
                    await file.mv(filePath);
                    request.body = { name: file.name, mime: file.mimetype, fileName: fileName, size: file.size, _dummyId: request.header("X-DUMMY-MODEL-ID") };
                    const result = await super.create(request);
                    if (result instanceof Error) {
                        try {
                            fs.unlinkSync(filePath);
                        } catch (error) {
                            return error;
                        }
                    }
                    return result;
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
        const model = result;
        try {
            fs.unlinkSync(path.resolve(arp.path, "uploads", model.fileName));
            return result;
        } catch (error) {
            return error;
        }
    }
}
