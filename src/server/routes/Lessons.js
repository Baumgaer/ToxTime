import ApiRoute from "~server/lib/ApiRoute";
import Lesson from "~server/models/Lesson";
import { isMongoId, merge } from "~common/utils";
import httpErrors from "http-errors";
import { v4 as uuid } from "uuid";
import CustomError from "~common/lib/CustomError";
import { copyFileSync } from "graceful-fs";
import { resolve } from "path";
import { path as rootPath } from "app-root-path";
import GameSession from "~server/models/GameSession";
import User from "~server/models/User";
import Item from "~server/models/Item";

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

        const lesson = await Lesson.Model.findById(request.params.id).exec();
        if (!lesson) return new httpErrors.NotFound();

        const gameSessions = await GameSession.Model.find({ lesson }).exec();

        const sessionIds = [];
        const itemIds = [];
        const sessionQuery = gameSessions.map(session => {
            sessionIds.push(session._id);
            itemIds.push(...session.inventory.map(item => item._id), ...session.grabbing.map(item => item._id));
            return { $or: [{ currentGameSessions: session }, { solvedGameSessions: session }] };
        });

        const result = await super.delete(request);

        // We do not want to delete sub objects in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        if (result.deleted) return result;

        const promises = [];

        if (sessionQuery.length && gameSessions.length) {
            promises.push(User.Model.updateMany({ $or: sessionQuery }, { $pullAll: { currentGameSessions: gameSessions, solvedGameSessions: gameSessions } }).exec());
        }

        if (sessionIds.length) promises.push(GameSession.Model.deleteMany({ _id: { $in: sessionIds } }));
        if (itemIds.length) promises.push(Item.Model.deleteMany({ _id: { $in: itemIds } }));

        await Promise.all(promises);

        return result;
    }

}
