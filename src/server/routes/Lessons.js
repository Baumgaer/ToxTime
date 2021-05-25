import ApiRoute from "~server/lib/ApiRoute";
import Lesson from "~server/models/Lesson";
import { isMongoId } from "~common/utils";
import httpErrors from "http-errors";
import CustomError from "~common/lib/CustomError";
import { copyFileSync, unlinkSync } from "graceful-fs";
import { resolve } from "path";
import { path as rootPath } from "app-root-path";

export default class Lessons extends ApiRoute {

    claimedExport = Lesson;

    @ApiRoute.get("/", { allowUser: true })
    async getAll() {
        return super.getAll();
    }

    @ApiRoute.get("/:id", { allowUser: true })
    async getById(request) {
        return super.getById(request);
    }

    @Lessons.post("/copy/:id")
    async copy(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");

        const result = await this.claimedExport.Model.findById(request.params.id).exec();
        if (!result) return new httpErrors.NotFound();
        const copy = await super.copy(request);

        if (copy instanceof Error) return copy;

        try {
            copyFileSync(resolve(rootPath, "avatars", `${result._id.toString()}.png`), resolve(rootPath, "avatars", `${copy._id.toString()}.png`));
        } catch (error) {
            console.error(error);
        }

        return copy;
    }

    @Lessons.delete("/:id")
    async delete(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");
        const result = await super.delete(request);

        if (result instanceof Error) return result;

        try {
            unlinkSync(resolve(rootPath, "avatars", `${result._id.toString()}.png`));
        } catch (error) {
            console.error(error);
        }

        return result;
    }

}
