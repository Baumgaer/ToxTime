import ApiClient from "~client/lib/ApiClient";
import Recipe from "~client/models/Recipe";
import { uniq, random, unescape } from "~common/utils";

export default class TemplateLiterals {

    lesson = null;
    session = null;
    model = null;

    constructor(session, model) {
        this.session = session;
        this.lesson = session.lesson;
        this.model = model;
    }

    getLiterals() {
        const modelRelatedOverwrites = this.lesson.overwrites[this.model._id];

        let customLiterals = {};

        if (modelRelatedOverwrites) {
            const localeSuffix = `_${window.activeUser.locale}`;
            const customVariables = Object.keys(modelRelatedOverwrites).filter((key) => key.endsWith(localeSuffix));
            customLiterals = Object.fromEntries(customVariables.map((customVariable) => [customVariable.split(localeSuffix)[0], modelRelatedOverwrites[customVariable]]));
        }

        let randomRecipe = null;
        return {
            ...customLiterals,
            userName: window.activeUser.getName(),
            lessonName: this.session.getName(),
            currentSceneName: this.session.currentScene.getName(),
            randomRecipeName: (...args) => {
                if (randomRecipe === null) randomRecipe = this.randomRecipe(...args);
                return (randomRecipe || new Recipe.Model({
                    name: window.$t('nothingFound')
                })).getName();
            }
        };
    }

    parseTemplate(templateString) {
        templateString = unescape(templateString);
        const regex = /\{\{\s(.*?)(?:\((?:(.*),?)*\))?\s\}\}/ig;
        const literals = this.getLiterals();

        const matches = templateString.match(regex);
        if (!matches) return templateString;

        for (const match of matches) {
            if (match.includes("(") && match.includes(")")) {
                const firstIndex = match.indexOf("(");
                const lastIndex = match.lastIndexOf(")");
                const funcName = match.slice(2, firstIndex).trim();
                const params = "[" + match.slice(firstIndex + 1, lastIndex).trim().replaceAll("'", "\"") + "]";
                templateString = templateString.replace(match, literals[funcName]?.(...JSON.parse(params)));
            } else templateString = templateString.replace(match, literals[match.slice(2, match.length - 2).trim()]);
        }
        return templateString;
    }

    randomRecipe(location, usedOrUnused, valid) {
        let recipes = [];
        let inputResources = null;
        if (location === "currentScene") {
            inputResources = this.session.getResources();
            for (const inputResource of inputResources) {
                const resources = [inputResource, ...inputResource.getResources()];
                for (const resource of resources) {
                    const recipeItems = ApiClient.store.indexValuesOf("recipeItems", resource);
                    for (const recipeItem of recipeItems) {
                        const recipe = ApiClient.store.indexValuesOf("recipes", recipeItem)[0];
                        recipes.push(recipe);
                    }
                }
            }
            recipes = uniq(recipes);
        } else recipes = this.session.lesson.getRecipes(true);
        if (usedOrUnused) {
            const usedRecipeIds = this.session.protocol.filter((entry) => entry.type === "exec").map((entry) => entry.object.split("_")[1]);
            if (usedOrUnused === "used") {
                recipes = recipes.filter((recipe) => usedRecipeIds.includes(recipe._id));
            } else recipes = recipes.filter((recipe) => !usedRecipeIds.includes(recipe._id));
        }
        if (valid) recipes = recipes.filter((recipe) => this.session.isValidRecipe(recipe, inputResources));
        return recipes[random(recipes.length - 1)];
    }
}
