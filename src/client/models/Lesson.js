import { LessonMixinClass } from "~common/models/Lesson";
import ClientModel from "~client/lib/ClientModel";
import GameSession from "~client/models/GameSession";
import ApiClient from "~client/lib/ApiClient";
import { flatten, difference, union, uniq } from "~common/utils";

const CommonClientLesson = LessonMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Lesson extends CommonClientLesson {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newFeminin")} ${window.$t('lesson')}`;
            }
        }
    };

    getAvatar() {
        const value = { title: window.$t("lesson") };
        if (this._id && this.scenes[0]) return Object.assign(this.scenes[0].getAvatar(), value);
        return Object.assign({
            type: "component",
            name: "school-icon"
        }, value);
    }

    @CommonClientLesson.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    async edit() {
        await super.edit();
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addLessons";
    }

    @CommonClientLesson.action("play", { type: "component", name: "play-icon" }, () => true)
    async play() {
        let session = window.activeUser.getGameSessionByLesson(this);

        if (!session) {
            session = ApiClient.store.addModel(new GameSession.Model({ lesson: this, currentScene: this.scenes[0] }));
            window.activeUser.currentGameSessions.push(session);
        } else {
            const indexInSolved = window.activeUser.solvedGameSessions.indexOf(session);
            if (indexInSolved >= 0) {
                window.activeUser.solvedGameSessions.splice(indexInSolved, 1);
                window.activeUser.currentGameSessions.push(session);
            }
        }

        await window.activeUser.save();
        window.activeUser.editingModel = session;
        window.activeUser.activeEditor = "playGame";
    }

    getResources() {
        const resources = [];
        for (const model of [...this.scenes, ...this.inventory]) resources.push(...model.getResources());
        for (const sceneObject of this.inventory) resources.push(sceneObject, ...sceneObject.getResources());
        return uniq(resources);
    }

    findRecipes(resources = this.getResources()) {
        let allRecipes = [];
        for (const resource of resources) {
            if (!ApiClient.store.indexes.recipeItems?.has(resource)) continue;
            const recipeItems = ApiClient.store.indexes.recipeItems.get(resource).values();
            for (const recipeItem of recipeItems) {
                if (!ApiClient.store.indexes.recipes?.has(recipeItem)) continue;
                const recipe = ApiClient.store.indexes.recipes.get(recipeItem).values().next().value;
                const validToUse = recipe.input.every((item) => resources.includes(item.object));
                if (validToUse) allRecipes.push(recipe);
            }
        }
        allRecipes = uniq(allRecipes);

        const output = flatten(allRecipes.map((recipe) => recipe.output)).map((resource) => resource.object);
        const outputResources = difference(output, resources);

        const allOutputResources = [...outputResources];
        for (const outputResource of outputResources) allOutputResources.push(...(outputResource.getResources?.() ?? []));

        if (!outputResources.length) return allRecipes;
        return union(allRecipes, this.findRecipes(union(allOutputResources, resources)));
    }

});
