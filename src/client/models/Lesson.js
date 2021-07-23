import { LessonMixinClass } from "~common/models/Lesson";
import MultiLingualDescribed from "~client/models/MultiLingualDescribed";
import GameSession from "~client/models/GameSession";
import ApiClient from "~client/lib/ApiClient";
import ClickArea from "~client/models/ClickArea";
import ActionObject from "~client/models/ActionObject";
import SceneObject from "~client/models/SceneObject";
import Label from "~client/models/Label";
import Entity from "~client/models/Entity";
import Scene from "~client/models/Scene";
import Recipe from "~client/models/Recipe";
import SpeechBubble from "~client/models/SpeechBubble";
import { flatten, difference, union, uniq, clone, cloneDeep } from "~common/utils";

const CommonMultiLingualDescribedLesson = LessonMixinClass(MultiLingualDescribed.RawClass);
export default MultiLingualDescribed.RawClass.buildClientExport(class Lesson extends CommonMultiLingualDescribedLesson {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newFeminin")} ${window.$t('lesson')}`;
            }
        }
    };

    getIcon() {
        return "school-icon";
    }

    getAvatar() {
        const value = { title: window.$t("lesson") };
        if (this._id && this.scenes[0]) return Object.assign(this.scenes[0].getAvatar(), value);
        return Object.assign({
            type: "component",
            name: this.getIcon()
        }, value);
    }

    @CommonMultiLingualDescribedLesson.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addLessons";
    }

    @CommonMultiLingualDescribedLesson.action("play", { type: "component", name: "play-icon" }, () => true)
    async play() {
        let session = window.activeUser.getGameSessionByLesson(this);

        if (!session) {
            const entities = this.entities.map((entity) => {
                return ApiClient.store.addModel(new Entity.Model({
                    name: entity.name,
                    actionObjects: clone(entity.actionObjects),
                    clickAreas: clone(entity.clickAreas),
                    currentPhenotype: entity.currentPhenotype,
                    overwrites: cloneDeep(entity.overwrites)
                }));
            });
            session = ApiClient.store.addModel(new GameSession.Model({
                lesson: this,
                currentScene: this.scenes[0],
                entities: entities
            }));
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

    getSpecificObjectsFor(model, resources = this.getResources()) {
        if (model instanceof SceneObject.RawClass) {
            return resources.filter((resource) => {
                return resource instanceof ActionObject.RawClass && resource.sceneObject === model;
            });
        }

        if (model instanceof Label.RawClass) {
            return resources.filter((resource) => {
                return (resource instanceof ActionObject.RawClass || resource instanceof ClickArea.RawClass) && resource.getLabels().includes(model);
            });
        }

        return [];
    }

    hasValidAnchor(model, resources) {
        return this.getSpecificObjectsFor(model, resources).length > 0;
    }

    hasValidInputFilter(recipeItem, resources) {
        const isIncluded = resources.includes(recipeItem.object);
        if (!isIncluded) return false;

        let hasValidAnchor = true;
        const isAoOrCa = recipeItem.object instanceof ActionObject.RawClass || recipeItem.object instanceof ClickArea.RawClass;
        if (recipeItem.location === "scene" && !isAoOrCa) hasValidAnchor = this.hasValidAnchor(recipeItem.object, resources);
        return isIncluded && hasValidAnchor;
    }

    hasValidOutputFilter(recipeItem, resources) {
        const model = recipeItem.object;
        if (!(model instanceof SpeechBubble.RawClass) && !(model instanceof Recipe.RawClass)) return true;
        if (model instanceof Recipe.RawClass) return this.isValidToUse(model, resources);
        const modelResources = [model.recipe, model.exitRecipe];
        return modelResources.every((recipe) => {
            if (!recipe) return true;
            return this.isValidToUse(recipe, resources);
        });
    }

    isValidToUse(recipe, resources) {
        const inputOk = recipe.input.every((recipeItem) => this.hasValidInputFilter(recipeItem, resources));
        const outputOk = recipe.output.every((recipeItem) => this.hasValidOutputFilter(recipeItem, resources));
        return inputOk && outputOk;
    }

    findRecipes(resources = this.getResources()) {
        let allRecipes = [];

        const invalidRecipeFilter = (recipe, allPossibleScenesResources) => {
            return recipe.output.every((recipeItem) => {
                if (!(recipeItem.object instanceof ClickArea.RawClass) && !(recipeItem.object instanceof ActionObject.RawClass)) return true;
                return allPossibleScenesResources.includes(recipeItem.object);
            });
        };

        const finalFilter = (allRecipes, allPossibleScenesResources) => {
            allRecipes = allRecipes.filter((recipe) => invalidRecipeFilter(recipe, allPossibleScenesResources));
            return allRecipes.filter((recipe) => {
                return allRecipes.every((aRecipe) => !aRecipe.getResources().includes(recipe)) && !this.excludedRecipes.includes(recipe);
            });
        };

        for (const resource of resources) {
            if (!ApiClient.store.index("recipeItems").has(resource)) continue;
            const recipeItems = ApiClient.store.indexValuesOf("recipeItems", resource);
            for (const recipeItem of recipeItems) {
                if (!ApiClient.store.index("recipes").has(recipeItem)) continue;
                const recipe = ApiClient.store.indexValuesOf("recipes", recipeItem)[0];
                const validToUse = this.isValidToUse(recipe, resources);
                if (validToUse) allRecipes.push(recipe);
            }
        }
        allRecipes = uniq(allRecipes).filter((recipe) => !this.excludedRecipes.includes(recipe));

        const output = flatten(allRecipes.map((recipe) => recipe.output)).map((recipeItem) => recipeItem.object);
        const outputResources = difference(output, resources);

        const allOutputResources = [...outputResources];
        for (const outputResource of outputResources) allOutputResources.push(...(outputResource.getResources?.() ?? []));

        const allPossibleScenes = union(this.scenes, resources.filter((resource) => resource instanceof Scene.RawClass));
        const allPossibleScenesResources = uniq(flatten(allPossibleScenes.map((scene) => scene.getResources())), this.inventory);

        if (outputResources.length) allRecipes = union(allRecipes, this.findRecipes(union(allOutputResources, resources)));
        return finalFilter(allRecipes, allPossibleScenesResources);
    }

});
