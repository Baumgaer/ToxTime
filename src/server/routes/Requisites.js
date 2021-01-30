import ApiRoute from "~server/lib/ApiRoute";
import Requisite from "~server/models/Requisite";
import { isMongoId } from "~common/utils";
import { readFileSync, writeFileSync } from "graceful-fs";
import { path as rootPath } from "app-root-path";
import { resolve, dirname } from "path";
import { sync as createDirSync } from "mkdirp";

export default class Requisites extends ApiRoute {

    claimedExport = Requisite;

    /**
     * Writes an svg file with given id as file name and request.body.content
     * as file content
     *
     * @param {import("express").Request} request the request
     * @returns {void}
     * @memberof Logout
     */
    @Requisites.put("/:id")
    async createAvatar(request) {
        if (!isMongoId(request.params.id) || typeof request.body.content !== "string") return false;
        const exists = await this.claimedExport.Model.findById(request.params.id).countDocuments().exec();
        if (!exists) return false;

        const path = resolve(rootPath, "avatars", `${request.params.id}.svg`);
        createDirSync(dirname(path));
        writeFileSync(path, request.body.content, { encoding: "utf-8" });
        return true;
    }

    /**
     * Returns the svg avatar if found
     *
     * @param {import("express").Request} request the request
     * @param {import("express").Response} response the response
     * @returns {Promise<User["Model"][]> | CustomError>}
     * @memberof Login
     */
    @Requisites.get("/:id", { allowUser: true })
    getAvatar(request, response) {
        if (!isMongoId(request.params.id)) return false;
        try {
            response.setHeader("Content-Type", "image/svg+xml");
            return readFileSync(resolve(rootPath, "avatars", `${request.params.id}.svg`), { encoding: "utf-8" }).toString();
        } catch (error) {
            console.error(error);
            return false;
        }
    }

}
