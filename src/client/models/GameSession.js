import { GameSessionMixinClass } from "~common/models/GameSession";
import ClientModel from "~client/lib/ClientModel";
import { intersection, flatten, uniq } from "~common/utils";
import ApiClient from "~client/lib/ApiClient";
import Knowledge from "~client/models/Knowledge";
import Item from "~client/models/Item";
import Label from "~client/models/Label";

/**
 * @typedef {InstanceType<import("~client/models/ClickArea")["default"]["RawClass"]>} ClickArea
 * @typedef {InstanceType<import("~client/models/ActionObject")["default"]["RawClass"]>} ActionObject
 * @typedef {InstanceType<import("~client/models/SceneObject")["default"]["RawClass"]>} SceneObject
 * @typedef {InstanceType<import("~client/models/Knowledge")["default"]["RawClass"]>} Knowledge
 * @typedef {InstanceType<import("~client/models/Label")["default"]["RawClass"]>} Label
 * @typedef {InstanceType<import("~client/models/Item")["default"]["RawClass"]>} Item
 * @typedef {InstanceType<import("~client/models/Recipe")["default"]["RawClass"]>} Recipe
 * @typedef {InstanceType<import("~client/models/RecipeItem")["default"]["RawClass"]>} RecipeItem
 *
 * @typedef {ClickArea | ActionObject | Item} InputResource
 * @typedef {ClickArea | ActionObject | SceneObject | Label | Knowledge} InputRecipeItemObject
 */
const CommonClientGameSession = GameSessionMixinClass(ClientModel);
export default ClientModel.buildClientExport(class GameSession extends CommonClientGameSession {

    getName() {
        return this.lesson?.getName();
    }

    toRequestObject(modelFilter) {
        return super.toRequestObject(modelFilter || ((model) => {
            return ["SceneObject", "ActionObject", "Scene", "Lesson", "ClickArea"].includes(model.className);
        }));
    }

    getNormalizedOverwrite(model, property) {
        const sessionOverwrite = this.getOverwrite(model, property);
        const lessonOverwrite = this.lesson.getOverwrite(model, property);

        let defaultValue;
        if (property === "amount") defaultValue = 1;
        if (property === "activated") defaultValue = true;
        if (property === "object") defaultValue = null;

        return sessionOverwrite ?? lessonOverwrite ?? defaultValue;
    }

    getRecipeObject(recipeItem) {
        const sessionOverWriteObjectString = this.getNormalizedOverwrite(recipeItem, "object");
        if (!sessionOverWriteObjectString) return recipeItem.object;
        const [collectionName, id] = sessionOverWriteObjectString.split("_");
        return ApiClient.store.getModelById(collectionName, id);
    }

    recipeItemToItem(recipeItem) {
        let recipeResources;
        let locationToGetItemFrom;
        if (recipeItem.object instanceof Knowledge.RawClass) return recipeItem.object;

        if (recipeItem.location === "scene") {
            recipeResources = this.currentScene.getResources();
            locationToGetItemFrom = "currentScene";
        }
        if (recipeItem.location === "hand") {
            recipeResources = flatten(this.grabbing.map((item) => item.getResources()));
            locationToGetItemFrom = "grabbing";
        }
        if (recipeItem.location === "inventory") {
            recipeResources = flatten(this.inventory.map((item) => item.getResources()));
            locationToGetItemFrom = "inventory";
        }

        let specificObjects = this.lesson.getSpecificObjectsFor(this.getRecipeObject(recipeItem), uniq(recipeResources));
        if (!specificObjects.length) {
            specificObjects = recipeResources.filter((resource) => {
                const recipeItemObject = this.getRecipeObject(recipeItem);
                if (recipeItemObject instanceof Label.RawClass) return resource.getLabels().includes(recipeItemObject);
                return resource === recipeItemObject;
            });
        }

        if (locationToGetItemFrom === "currentScene") return specificObjects[0];
        return this[locationToGetItemFrom].find((item) => item.object === specificObjects[0]);
    }

    /**
     *
     *
     * @param {RecipeItem} recipeItem
     * @returns {boolean}
     */
    checkRecipeItemLocation(recipeItem) {
        /** @type {InputRecipeItemObject} */
        const obj = this.getRecipeObject(recipeItem);
        if (obj instanceof Knowledge.RawClass) return this.KnowledgeBase.includes(obj);

        if (recipeItem.location === "hand") return flatten(this.grabbing.map((item) => item.getResources())).includes(obj);

        if (recipeItem.location === "scene") {
            const resources = this.currentScene.getResources();
            return resources.filter((resource) => {
                const hasAmount = this.getNormalizedOverwrite(resource, "amount") > 0;
                const isActivated = this.getNormalizedOverwrite(resource, "activated");
                return hasAmount && isActivated;
            }).includes(obj);
        }

        return false;
    }

    checkRecipeItemAmount(recipeItem) {
        const itemOrSpecificObject = this.recipeItemToItem(recipeItem);
        if (itemOrSpecificObject instanceof Knowledge.RawClass) return true;
        if (itemOrSpecificObject instanceof Item.RawClass) return itemOrSpecificObject.amount >= recipeItem.amount;
        let amount = this.getNormalizedOverwrite(itemOrSpecificObject, "amount");
        return amount >= recipeItem.amount;
    }

    /**
     *
     *
     * @param {Recipe} recipe
     * @returns {boolean}
     */
    isValidRecipe(recipe) {
        const possibleRecipes = this.lesson.getRecipes(true);
        if (!possibleRecipes.includes(recipe)) return false;

        const allItemsInCorrectLocation = recipe.input.every(this.checkRecipeItemLocation.bind(this));
        if (!allItemsInCorrectLocation) return false;

        const allItemsHaveCorrectAmount = recipe.input.every(this.checkRecipeItemAmount.bind(this));
        if (!allItemsHaveCorrectAmount) return false;

        return true;
    }

    /**
     *
     *
     * @param {InputResource[]} inputResources
     * @returns
     */
    findRecipes(inputResources) {
        const allRecipes = [];

        for (const inputResource of inputResources) {
            const resources = [inputResource, ...inputResource.getResources()];
            const resourceRecipes = [];
            for (const resource of resources) {
                const recipeItems = ApiClient.store.indexValuesOf("recipeItems", resource);
                for (const recipeItem of recipeItems) {
                    const recipe = ApiClient.store.indexValuesOf("recipes", recipeItem)[0];
                    resourceRecipes.push(recipe);
                }
            }
            if (resourceRecipes.length) allRecipes.push(resourceRecipes);
        }

        return intersection(...allRecipes).filter(this.isValidRecipe.bind(this));
    }

});
