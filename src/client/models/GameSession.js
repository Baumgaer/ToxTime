import { GameSessionMixinClass } from "~common/models/GameSession";
import ClientModel from "~client/lib/ClientModel";
import { intersection, flatten, flattenDeep, uniq, unescape, difference } from "~common/utils";
import ApiClient from "~client/lib/ApiClient";
import Knowledge from "~client/models/Knowledge";
import Item from "~client/models/Item";
import Label from "~client/models/Label";
import ClickArea from "~client/models/ClickArea";
import ActionObject from "~client/models/ActionObject";

/**
 * @typedef {InstanceType<import("~client/models/GameObject")["default"]["RawClass"]>} GameObject
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
        return unescape(this.lesson?.getName());
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

    getRealRecipeItemObject(recipeItem) {
        const sessionOverWriteObjectString = this.getNormalizedOverwrite(recipeItem, "object");
        if (!sessionOverWriteObjectString) return recipeItem.object;
        const [collectionName, id] = sessionOverWriteObjectString.split("_");
        return ApiClient.store.getModelById(collectionName, id);
    }

    /**
     *
     *
     * @param {RecipeItem} recipeItem
     * @param {"validate" | "collect" | "spread"} [mode="validate"]
     * @returns {Item | GameObject | Knowledge}
     */
    recipeItemToMostSpecificObject(recipeItem, mode = "validate") {
        let recipeResources;
        let locationToGetItemFrom;

        const realRecipeItemObject = this.getRealRecipeItemObject(recipeItem);
        if (recipeItem.object instanceof Knowledge.RawClass) return recipeItem.object;

        if (recipeItem.location === "scene" || mode === "spread") {
            recipeResources = this.currentScene.getResources();
            locationToGetItemFrom = "currentScene";
        } else if (recipeItem.location === "hand") {
            recipeResources = flatten(this.grabbing.map((item) => item.getResources()));
            locationToGetItemFrom = "grabbing";
        } else if (recipeItem.location === "inventory") {
            recipeResources = flatten(this.inventory.map((item) => item.getResources()));
            locationToGetItemFrom = "inventory";
        }

        if (mode === "spread") {
            recipeResources = recipeResources.filter((resource) => {
                if (!recipeItem.canBeSpecifiedToActionObject() && resource instanceof ActionObject.RawClass) return false;
                return !(resource instanceof ClickArea.RawClass);
            });
        }

        let specificObjects = this.lesson.getSpecificObjectsFor(realRecipeItemObject, uniq(recipeResources));
        if (!specificObjects.length) {
            specificObjects = recipeResources.filter((resource) => {
                if (realRecipeItemObject instanceof Label.RawClass) return resource.getLabels().includes(realRecipeItemObject);
                return resource === realRecipeItemObject;
            });
        }

        if (!specificObjects.length) return recipeItem.object;
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
        const obj = this.recipeItemToMostSpecificObject(recipeItem);
        if (obj instanceof Knowledge.RawClass) return this.KnowledgeBase.includes(obj);

        if (recipeItem.location === "hand") return flatten(this.grabbing.map((item) => item.getResources())).concat(this.grabbing).includes(obj);

        if (recipeItem.location === "scene") {
            const resources = this.currentScene.getResources();
            return Boolean(resources.find((resource) => {
                if (resource instanceof Label.RawClass) return false;
                if (resource !== obj) return false;
                const hasAmount = this.getNormalizedOverwrite(resource, "amount") > 0;
                if (!hasAmount) return false;
                const isActivated = this.getNormalizedOverwrite(resource, "activated");
                if (!isActivated) return false;
                return true;
            }));
        }

        return false;
    }

    checkRecipeItemAmount(recipeItem) {
        const itemOrSpecificObject = this.recipeItemToMostSpecificObject(recipeItem);
        if (itemOrSpecificObject instanceof Knowledge.RawClass) return true;

        let amountToCheck = this.getNormalizedOverwrite(itemOrSpecificObject, "amount");
        if (itemOrSpecificObject instanceof Item.RawClass) amountToCheck = itemOrSpecificObject.amount;

        const recipeItemAmount = this.getOverwrite(recipeItem, "amount") ?? recipeItem.amount;
        const recipe = ApiClient.store.indexValuesOf("recipes", recipeItem)[0];
        if (recipe.isQuantityExact() && recipeItemAmount && amountToCheck !== recipeItemAmount) return false;

        return amountToCheck >= recipeItemAmount;
    }

    checkRecipeItemNecessaryResources(recipeItem, resources) {
        const allResources = uniq(flattenDeep(resources.map((resource) => [resource.getSubObjects(true), resource.getLabels()])).concat(resources));
        const realRecipeItemObject = this.getRealRecipeItemObject(recipeItem);
        return allResources.includes(realRecipeItemObject) || realRecipeItemObject instanceof Knowledge.RawClass && this.KnowledgeBase.includes(realRecipeItemObject);
    }

    compactResources(resources) {
        const compactedResources = [];
        resourceLoop: for (const resource of resources) {
            const resourceResources = resource.getResources();
            for (let index = 0; index < compactedResources.length; index++) {
                const compactedResource = compactedResources[index];
                const compactedResourceResources = compactedResource.getResources();
                if (compactedResourceResources.includes(resource)) continue resourceLoop;
                if (resourceResources.includes(compactedResource)) {
                    compactedResources[index] = resource;
                    continue resourceLoop;
                }
            }
            compactedResources.push(resource);
        }
        return compactedResources;
    }

    /**
     *
     *
     * @param {Recipe} recipe
     * @returns {boolean}
     */
    isValidRecipe(recipe, resources) {
        const possibleRecipes = this.lesson.getRecipes(true);
        if (!possibleRecipes.includes(recipe)) return false;

        const allItemsHaveCorrectAmount = recipe.input.every(this.checkRecipeItemAmount.bind(this));
        if (!allItemsHaveCorrectAmount) return false;

        const allItemsInCorrectLocation = recipe.input.every(this.checkRecipeItemLocation.bind(this));
        if (!allItemsInCorrectLocation) return false;

        if (resources) {
            const allItemsInNecessaryResources = recipe.input.every((recipeItem) => this.checkRecipeItemNecessaryResources(recipeItem, resources));
            if (!allItemsInNecessaryResources) return false;

            if (recipe.isIngredientsExact()) {
                const mostSpecificRecipeItemObjects = recipe.input.map((recipeItem) => {
                    const mostSpecificObject = this.recipeItemToMostSpecificObject(recipeItem);
                    if (mostSpecificObject instanceof Item.RawClass) return mostSpecificObject.object;
                    return mostSpecificObject;
                });
                const compactedResources = this.compactResources(resources);
                const objectDifference = difference(compactedResources, mostSpecificRecipeItemObjects);
                return objectDifference.filter((recipeItemObject) => !(recipeItemObject instanceof Knowledge.RawClass)).length === 0;
            }
        }

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
                    if (flatten(allRecipes).includes(recipe)) {
                        resourceRecipes.push(recipe);
                    } else if (!resourceRecipes.includes(recipe) && this.isValidRecipe(recipe, inputResources)) resourceRecipes.push(recipe);
                }
            }
            if (resourceRecipes.length) allRecipes.push(resourceRecipes);
        }

        return intersection(...allRecipes);
    }

});
