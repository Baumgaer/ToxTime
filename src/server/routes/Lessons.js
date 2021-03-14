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

    @Lessons.post("/copy/:id")
    async copy(request) {
        if (!request.params.id || !isMongoId(request.params.id)) return new CustomError("NotAMongoId");

        const result = await this.claimedExport.Model.findById(request.params.id).exec();
        if (!result) return new httpErrors.NotFound();
        const plainObj = result.toObject();
        delete plainObj._id;
        plainObj._dummyId = uuid();

        plainObj.scenes = plainObj.scenes.map((scene) => scene._id);

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
        if (result instanceof Error) return result;

        await Promise.all([
            await User.Model.updateMany({ $or: sessionQuery }, { $pullAll: { currentGameSessions: gameSessions, solvedGameSessions: gameSessions } }).exec(),
            await GameSession.Model.deleteMany({ _id: { $in: sessionIds } }),
            await Item.Model.deleteMany({ _id: { $in: itemIds } })
        ]);

        return result;
    }

}
