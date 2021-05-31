import { GameSessionMixinClass } from "~common/models/GameSession";
import ClientModel from "~client/lib/ClientModel";
import { uniq, flatten } from "~common/utils";
import ApiClient from "~client/lib/ApiClient";
import ActionObject from "~client/models/ActionObject";
import Item from "~client/models/Item";
import Label from "~client/models/Label";

const CommonClientGameSession = GameSessionMixinClass(ClientModel);
export default ClientModel.buildClientExport(class GameSession extends CommonClientGameSession {

    cacheHash = ""

    getName() {
        return this.lesson?.getName();
    }

    toRequestObject(modelFilter) {
        return super.toRequestObject(modelFilter || ((model) => {
            return ["SceneObject", "ActionObject", "Scene", "Lesson", "ClickArea"].includes(model.className);
        }));
    }

    getOverwriteValue(id, property) {
        const sessionOverwrite = this.getOverwrite(id);
        const lessonOverwrite = this.lesson.getOverwrite(id);

        let defaultValue;
        if (property === "amount") defaultValue = 1;
        if (property === "activated") defaultValue = true;
        if (property === "object") defaultValue = null;

        return sessionOverwrite[property] ?? lessonOverwrite[property] ?? defaultValue;
    }

    getResources(include) {
        const resources = [...this.knowledgeBase];
        for (const model of [...include, ...this.grabbing, ...this.inventory]) {
            let obj = model instanceof Item.RawClass ? model.object : model;
            if (!obj) continue;
            resources.push(obj, ...obj.getLabels());
            if (obj instanceof ActionObject.RawClass) resources.push(obj.sceneObject, ...obj.sceneObject.getLabels());
        }
        return uniq(resources);
    }

    getRecipeObject(recipeItem) {
        const sessionOverWriteObjectString = this.getOverwriteValue(recipeItem._id, "object");
        if (!sessionOverWriteObjectString) return recipeItem.object;
        const [collectionName, id] = sessionOverWriteObjectString.split("_");
        return ApiClient.store.getModelById(collectionName, id);
    }

    findRecipes(resources = this.getResources()) {
        const recipes = [];

        const isValid = (recipe) => {
            // const isIngredientsExact = recipe.transitionSettings.ingredientsExact;
            // const isQuantityExact = recipe.transitionSettings.quantityExact;
            const allIngredientsAvailable = recipe.input.every((recipeItem) => {
                return resources.includes(this.getRecipeObject(recipeItem));
            });

            if (!allIngredientsAvailable) return false;

            const allLocationCorrect = recipe.input.every((recipeItem) => {
                let recipeResources = [];
                if (recipeItem.object.className === "Knowledge") return this.knowledgeBase.includes(recipeItem.object);
                if (recipeItem.location === "scene") recipeResources = this.currentScene.getResources(this.cacheHash);
                if (recipeItem.location === "hand") recipeResources = flatten(this.grabbing.map((item) => item.getResources(this.cacheHash)));
                if (recipeItem.location === "inventory") recipeResources = flatten(this.inventory.map((item) => item.getResources(this.cacheHash)));
                let specificObjects = this.lesson.getSpecificObjectsFor(this.getRecipeObject(recipeItem), uniq(recipeResources));
                if (!specificObjects.length) {
                    console.log(recipe);
                    specificObjects = recipeResources.filter((resource) => {
                        const recipeItemObject = this.getRecipeObject(recipeItem);
                        if (recipeItemObject instanceof Label.RawClass) return resource.getLabels().includes(recipeItemObject);
                        return resource === recipeItemObject;
                    });
                }
                return specificObjects.length > 0;
            });

            if (!allLocationCorrect) return false;
            return true;
        };

        for (const resource of resources) {
            if (!ApiClient.store.index("recipeItems").has(resource)) continue;
            const recipeItems = ApiClient.store.indexValuesOf("recipeItems", resource);
            for (const recipeItem of recipeItems) {
                if (!ApiClient.store.index("recipes").has(recipeItem)) continue;
                const recipe = ApiClient.store.indexValuesOf("recipes", recipeItem)[0];
                if (isValid(recipe)) recipes.push(recipe);
            }
        }

        return uniq(recipes);
    }

});
