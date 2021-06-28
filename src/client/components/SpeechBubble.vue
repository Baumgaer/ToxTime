<template>
    <div>
        <div class="speechBubble" ref="speechBubble" :style="`top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px`"></div>
        <div class="speechBubblePopup" ref="speechBubblePopup" v-show="sceneItem">
            <div v-if="model">
                <div class="closeButton" @click="hide">
                    <close-icon />
                </div>
                <div class="speech"><pre>{{ content }}</pre></div>
                <div class="button" v-if="model.recipe" @click="next">{{ $t('next') }}</div>
                <div class="button" v-else @click="hide">{{ $t('finish') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import tippy, {sticky} from "tippy.js";
import { compile, Environment } from "nunjucks/browser/nunjucks";
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
        content() {
            const template = compile(unescape(this.model[`${this.property}_${window.activeUser.locale}`]), this.env);
            let randomRecipe = null;
            try {
                const rendered = template.render({
                    activeUser: window.activeUser,
                    userName: window.activeUser.getName(),
                    session: this.session,
                    lessonName: this.session.getName(),
                    currentSceneName: this.session.currentScene.getName(),
                    recipes: this.session.lesson.getRecipes(true),
                    randomRecipeName: (...args) => {
                        if (randomRecipe === null) randomRecipe = this.randomRecipe(...args);
                        return (randomRecipe || new Recipe.Model({
                            name: this.$t('nothingFound')
                        })).getName();
                    },
                    anotherRandomRecipe: (...args) => {
                        let counter = 0;
                        let anotherRandomRecipe = this.randomRecipe(...args);
                        while(randomRecipe && randomRecipe === anotherRandomRecipe && counter < 10) {
                            anotherRandomRecipe = this.randomRecipe(...args);
                            counter++;
                        }
                        return anotherRandomRecipe;
                    }
                });
                return rendered;
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
            property: "description",
            env: new Environment(null, {
                lstripBlocks: true,
                trimBlocks: true
            })
        };
    },
    mounted() {
        window.addEventListener("resize", () => {
            if (!this.tippy || !this.sceneItem || !this.tippy.state.isVisible) return;
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
            if (!this.sceneItem) return;
            const viewCoords = this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topLeft);
            const width = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topRight).subtract(viewCoords).length);
            const height = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.bottomLeft).subtract(viewCoords).length);
            const top = Math.round(viewCoords.y) + 55;
            const left = Math.round(viewCoords.x);
            return { width, height, top, left };
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
        async next() {
            if (!window.activeUser.editingModel.isValidRecipe(this.model.recipe)) {
                this.property = "error";
            } else {
                try {
                    await this.execRecipeFunc(this.model.recipe, this.sceneItem.model);
                    this.property = "description";
                } catch (_error) {
                    this.property = "error";
                }
            }
        },
        show(scene, clickedModel, speechBubbleModel) {
            this.model = speechBubbleModel;
            this.createTippy();
            const project = scene.paper.project;
            this.sceneItem = project.activeLayer.getItem((item) => item.model === clickedModel);
            if (!this.sceneItem) return;
            Object.assign(this, this.calcSizes());
            setTimeout(this.tippy.show.bind(this.tippy));
        },
        hide() {
            this.sceneItem = null;
            this.model = null;
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/SpeechBubble.less"></style>
