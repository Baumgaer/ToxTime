<template>
    <div>
        <div class="speechBubble" ref="speechBubble" :style="`top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px`"></div>
        <div class="speechBubblePopup" ref="speechBubblePopup">
            <div v-if="model">
                <div class="closeButton" @click="close">
                    <close-icon />
                </div>
                <div class="speech"><pre>{{ content }}</pre></div>
                <div class="button" v-if="hasNextBubble" @click="next">{{ $t('next') }}</div>
                <div class="button" v-else @click="finish">{{ $t('finish') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import tippy, {sticky} from "tippy.js";
import { uniq, random, unescape } from "~common/utils";
import GameSession from "~client/models/GameSession";
import Recipe from "~client/models/Recipe";
import ApiClient from "~client/lib/ApiClient";

export default {
    props: {
        session: {
            type: GameSession.RawClass,
            required: true
        },
        execRecipeFunc: {
            type: Function,
            required: true
        }
    },
    computed: {
        hasNextBubble() {
            return this.model.recipe && this.model.recipe.output.some((recipeItem) => recipeItem.speechBubble);
        },
        content() {
            if (this.error) return this.error;
            if (this.preparedContent) return this.preparedContent;

            let randomRecipe = null;
            const literals = {
                userName: window.activeUser.getName(),
                lessonName: this.session.getName(),
                currentSceneName: this.session.currentScene.getName(),
                randomRecipeName: (...args) => {
                    if (randomRecipe === null) randomRecipe = this.randomRecipe(...args);
                    return (randomRecipe || new Recipe.Model({
                        name: this.$t('nothingFound')
                    })).getName();
                }
            };
            try {
                const regex = /\{\{\s(.*?)(?:\((?:(.*),?)*\))?\s\}\}/ig;
                /** @type {string} */
                const userLangString = `${this.property}_${window.activeUser.locale}`;
                const fallbackString = `${this.property}_en-us`;
                let result = unescape(this.model[userLangString] || this.model[fallbackString]);
                const matches = result.match(regex);
                if (matches) {
                    for (const match of matches) {
                        if (match.includes("(") && match.includes(")")) {
                            const firstIndex = match.indexOf("(");
                            const lastIndex = match.lastIndexOf(")");
                            const funcName = match.slice(2, firstIndex).trim();
                            const params = "[" + match.slice(firstIndex + 1, lastIndex).trim().replaceAll("'", "\"") + "]";
                            result = result.replace(match, literals[funcName]?.(...JSON.parse(params)));
                        } else result = result.replace(match, literals[match.slice(2, match.length - 2).trim()]);
                    }
                }
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                this.preparedContent = result;
                return result;
            } catch (error) {
                return this.$t('somethingWentWrong', {
                    adminMail: window.process.environment.APP_MAINTAINER_MAIL,
                    error: error.toString()
                });
            }
        }
    },
    data() {
        return {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            tippy: null,
            sceneItem: null,
            model: null,
            preparedContent: null,
            property: "description",
            error: null
        };
    },
    mounted() {
        window.addEventListener("resize", () => {
            if (!this.tippy || !this.tippy.state.isVisible) return;
            Object.assign(this, this.calcSizes());
        });
    },
    methods: {
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
        },
        calcSizes() {
            if (this.sceneItem) {
                const viewCoords = this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topLeft);
                const width = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topRight).subtract(viewCoords).length);
                const height = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.bottomLeft).subtract(viewCoords).length);
                const top = Math.round(viewCoords.y) + 55;
                const left = Math.round(viewCoords.x);
                return { width, height, top, left };
            }
            return {
                width: 0,
                height: 0,
                top: Math.round(this.$parent.$el.offsetHeight / 2),
                left: Math.round(this.$parent.$el.offsetWidth / 2)
            };
        },
        createTippy() {
            if (this.tippy) return;
            this.tippy = tippy(this.$refs.speechBubble, {
                appendTo: this.$parent.$el,
                content: this.$refs.speechBubblePopup,
                placement: "auto-start",
                theme: "material",
                sticky: true,
                interactive: true,
                hideOnClick: false,
                interactiveBorder: 20,
                plugins: [sticky],
                zIndex: 20,
                trigger: "manual",
                showOnCreate: false
            });
        },
        async next(recipe) {
            if (!recipe || recipe instanceof Event) recipe = this.model.recipe;
            if (!window.activeUser.editingModel.isValidRecipe(recipe)) {
                this.preparedContent = null;
                this.property = "error";
            } else {
                try {
                    await this.execRecipeFunc(recipe, this.sceneItem?.model);
                    this.property = "description";
                } catch (error) {
                    this.error = error.toString();
                }
            }
        },
        async finish() {
            await this.next();
            /** @type {string} */
            const userLangString = `${this.property}_${window.activeUser.locale}`;
            const fallbackString = `${this.property}_en-us`;
            const stringToDisplay = unescape(this.model[userLangString] || this.model[fallbackString]);
            if (this.error || this.property === "error") {
                if (!stringToDisplay && !this.error) {
                    this.$toasted.error(this.$t('invalidRecipe'));
                    this.hide();
                }
            } else this.hide();
        },
        async close() {
            if (this.model.exitRecipe) await this.next(this.model.exitRecipe);
            this.hide();
        },
        show(scene, clickedModel, speechBubbleModel) {
            this.preparedContent = null;
            this.model = speechBubbleModel;
            this.createTippy();
            const project = scene.paper.project;
            if (clickedModel) {
                this.sceneItem = project.activeLayer.getItem((item) => item.model === clickedModel);
            } else this.sceneItem = null;
            Object.assign(this, this.calcSizes());
            setTimeout(this.tippy.show.bind(this.tippy));
        },
        hide() {
            this.sceneItem = null;
            this.model = null;
            this.error = null;
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/SpeechBubble.less"></style>
