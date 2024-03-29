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
        const result = await super.getById(request);
        if (result instanceof Error) return result;
        const model = result;
        if (!model) return httpErrors.NotFound();
        if (model.fileName.endsWith(".svg")) response.setHeader("Content-Type", "image/svg+xml");

        const filePath = path.resolve(arp.path, "uploads", model.fileName);
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) return false;
        response.setHeader("Last-Modified", stats.mtime.toUTCString());
        if (model.mime.startsWith("audio") || model.mime.startsWith("video")) return this.streamMedia(request, response, model, stats);
        if (this.isFresh(request, response)) return 304;
        return fs.readFileSync(filePath);
    }

    streamMedia(request, response, model, stats) {
        const filePath = path.resolve(arp.path, "uploads", model.fileName);
        const range = request.headers.range;

        if (range !== undefined) {
            const [partialStart, partialEnd] = range.replace(/bytes=/, "").split("-");

            if ((isNaN(partialStart) && partialStart.length > 1) || (isNaN(partialEnd) && partialEnd.length > 1)) {
                return 500; //ERR_INCOMPLETE_CHUNKED_ENCODING
            }

            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : stats.size - 1;
            const contentLength = (end - start) + 1;

            response.status(206).header({
                'Content-Type': model.mime,
                'Content-Length': contentLength,
                'Content-Range': "bytes " + start + "-" + end + "/" + stats.size
            });

            return fs.createReadStream(filePath, { start: start, end: end });
        }
        response.header({ 'Content-Type': model.mime, 'Content-Length': stats.size });
        return fs.createReadStream(filePath);
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

        // We do not want to delete the file in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        if (result.deleted) return result;

        try {
            fs.unlinkSync(path.resolve(arp.path, "uploads", result.fileName));
            return result;
        } catch (error) {
            return error;
        }
    }
}
