import { Forbidden, NotFound } from "http-errors";
import ApiRoute from "~server/lib/ApiRoute";
import GameSession from "~server/models/GameSession";
import User from "~server/models/User";
import Recipe from "~server/models/Recipe";
import { isMongoId, isValue } from "~common/utils";

export default class GameSessions extends ApiRoute {

    claimedExport = GameSession;

    async getOwner(request) {
        const id = request.params.id;
        // In case of the user is edited
        let gameSessionOwner = request.object;
        // In case of the game session is edited
        if (request.object instanceof GameSession.Model) gameSessionOwner = request.object.creator;
        // In case of another http method than patch is used
        if (!(gameSessionOwner instanceof User.Model)) {
            gameSessionOwner = await User.Model.findOne({ $or: [{ currentGameSessions: id }, { solvedGameSessions: id }] }).exec();
        }

        if (request.user._id?.toString() !== gameSessionOwner._id?.toString() && !request.user.isAdmin) return false;
        if (!gameSessionOwner.populated("currentGameSessions") && !gameSessionOwner.populated("solvedGameSessions")) {
            gameSessionOwner = await User.Model.findById(gameSessionOwner._id.toString()).exec();
        }
        return gameSessionOwner;
    }

    async isAllowed(request) {
        const id = request.params.id;
        if (!isMongoId(id)) return false;
        if (request.body.lesson && !isMongoId(request.body.lesson)) return false;
        if (request.body.currentScene && !isMongoId(request.body.currentScene)) return false;
        if (request.body.knowledgeBase?.some((entry) => !isMongoId(entry)) ?? false) return false;

        const inventoryValidator = (entry) => {
            const isSelfValid = isMongoId(entry);
            const actionObjectOrSceneObjectIsValid = isMongoId(entry.actionObject || entry.sceneObject);
            const bothAreNull = (!isValue(entry.actionObject) && !isValue(entry.sceneObject));
            return !(isSelfValid || actionObjectOrSceneObjectIsValid || bothAreNull);
        };

        // If these are not arrays it will fail on write
        if (request.body.inventory?.some?.(inventoryValidator) ?? false) return false;
        if (request.body.grabbing?.some?.(inventoryValidator) ?? false) return false;

        const entityValidator = (entity) => {
            if (isMongoId(entity)) return false;
            const someActionObjectsInvalid = entity.actionObjects?.some?.(actionObject => !isMongoId(actionObject));
            const someClickAreasInvalid = entity.clickAreas?.some?.(clickArea => !isMongoId(clickArea));
            const phenotypeIsInvalid = isValue(entity.currentPhenotype) && !isMongoId(entity.currentPhenotype);
            return phenotypeIsInvalid && someActionObjectsInvalid && someClickAreasInvalid;
        };

        if (request.body.entities?.some?.(entityValidator) ?? false) return false;

        const filter = (session) => session?._id.toString() === id || session === id;

        const gameSessionOwner = await this.getOwner(request);
        return Boolean(gameSessionOwner.currentGameSessions.find(filter) || gameSessionOwner.solvedGameSessions.find(filter));
    }

    /**
     * Uses the default create function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.post("/", { allowUser: true })
    async create(request) {
        if (!request.user.isAdmin) delete request.body.grade;
        if (request.body.lesson && !isMongoId(request.body.lesson)) return new Forbidden();
        const filter = (session) => {
            const storedLessonId = session?.lesson?._id.toString();
            if (!storedLessonId) return true;
            return storedLessonId === request.body.lesson || storedLessonId === request.body.lesson._id;
        };
        if (!request.body.lesson || request.user.currentGameSessions.find(filter) || request.user.solvedGameSessions.find(filter)) return new Forbidden();
        return await super.create(request);
    }

    /**
     * Uses the default update function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.patch("/:id", { allowUser: true })
    async update(request) {
        if (!await this.isAllowed(request)) return new Forbidden();
        if (!request.user.isAdmin) delete request.body.grade;
        return await super.update(request);
    }

    /**
     * Uses the default delete function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.delete("/:id", { allowUser: true })
    async delete(request) {
        if (!await this.isAllowed(request)) return new Forbidden();
        return await super.delete(request);
    }

    /**
     * Uses the default update function. This is just for overwriting permissions
     *
     * @param {import("express").Request} request
     * @returns {Promise<Error | import("~server/lib/ServerModel").default>}
     * @memberof ApiRoute
     */
    @GameSessions.patch("/:id/finish", { allowUser: true })
    async finish(request) {
        if (!await this.isAllowed(request)) return new Forbidden();
        if (!request.user.isAdmin) delete request.body.grade;

        const id = request.params.id;

        const updateResult = await super.update(request);
        if (request.body.grade) return updateResult;

        const model = await this.claimedExport.Model.findById(id).exec();
        if (!model) return new NotFound();

        const executedRecipes = model.protocol.filter((entry) => {
            if (entry.type !== "exec") return false;
            return true;
        }).map((entry) => {
            const _id = entry.object.split("_")[1];
            return Recipe.Model.findById(_id).exec();
        });

        const totalPoints = model.lesson.getTotalPoints();
        let points = 0;
        (await Promise.all(executedRecipes)).forEach((recipe) => {
            points += Number(model.lesson.getOverwrite(recipe, "points"));
        });

        points += Number(model.lesson.goals[model.answer].points);
        model.grade = Math.max((totalPoints !== 0 ? (points / totalPoints) : 0) * 100, 0);
        const owner = await this.getOwner(request);
        const sessionIndex = owner.currentGameSessions.indexOf(model);
        owner.currentGameSessions.splice(sessionIndex, 1);
        owner.solvedGameSessions.push(model);
        await owner.save();
        return model.save();
    }

}
