<template>
    <div class="player">
        <EditorHead
            :name="model.lesson.name"
            :model="model"
            :nameIsTranslated="true"
            :onSaveButtonClick="onSaveButtonClick.bind(this)"
            @preCloseButtonClickConfirm="onPreCloseButtonClickConfirm"
        >
            <Button
                :name="!inFullscreen ? 'fullscreen' : 'fullscreenExit'"
                :showLabel="false"
                @click="onFullscreenButtonClick"
            >
                <fullscreen-icon v-if="!inFullscreen" />
                <fullscreen-exit-icon v-else />
            </Button>
        </EditorHead>
        <section v-for="scene in scenes" :key="scene._id">
            <GraphicViewer
                :model="scene"
                :showClickAreas="showClickAreas"
                :adjustToBorder="true"
                :clickFunction="onSceneClick"
                :ref="`scene_${scene._id}`"
                v-show="model.currentScene === scene"
                @actionObjectGroupPrepared="onActionObjectGroupOrClickAreaPrepared"
                @clickAreaPrepared="onActionObjectGroupOrClickAreaPrepared"
            />
            <SpeechBubbleComponent :ref="`speechBubble_${scene._id}`" :execRecipeFunc="execRecipe" :session="model" />
        </section>
        <section class="protocol"></section>
        <Inventory :model="model" icon="hand-left-icon" ref="grabbing" :field="'grabbing'" :minimumSlots="0" class="grabbing">
            <Button class="combineButton" name="combine" @click="onCombineButtonClick">
                <call-merge-icon />
            </Button>
        </Inventory>
        <Inventory :model="model" icon="bag-personal-icon" ref="inventory" />
        <div class="sidebar">
            <SceneSwitcher class="sceneSwitcher" :model="model" />
            <Tablet class="tablet" :model="model" ref="tablet" />
        </div>
        <div class="loading" v-if="loading">
            <div class="spinner">
                <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
        </div>
    </div>
</template>

<script>
import GraphicViewer from "~client/components/GraphicViewer";
import EditorHead from "~client/components/EditorHead";
import GameSession from "~client/models/GameSession";
import Label from "~client/models/Label";
import Item from "~client/models/Item";
import Knowledge from "~client/models/Knowledge";
import ActionObject from '~client/models/ActionObject';
import ClickArea from '~client/models/ClickArea';
import File from '~client/models/File';
import Scene from '~client/models/Scene';
import SceneObject from '~client/models/SceneObject';
import SpeechBubble from '~client/models/SpeechBubble';
import Recipe from '~client/models/Recipe';

import SpeechBubbleComponent from '~client/components/SpeechBubble';
import SceneSwitcher from "~client/components/SceneSwitcher";
import Tablet from "~client/components/Tablet";
import Inventory from "~client/components/Inventory";
import Button from "~client/components/Button";
import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

import { Layer, Group } from "paper";
import { flatten, uniq, clone } from "~common/utils";

/**
 * @typedef {InstanceType<import("~client/models/Recipe")["default"]["RawClass"]>} Recipe
 * @typedef {InstanceType<import("~client/models/GameObject")["default"]["RawClass"]>} GameObject
 * @typedef {InstanceType<import("~client/models/Label")["default"]["RawClass"]>} Label
 * @typedef {InstanceType<import("~client/models/Knowledge")["default"]["RawClass"]>} Knowledge
 * @typedef {InstanceType<import("~client/models/File")["default"]["RawClass"]>} File
 * @typedef {InstanceType<import("~client/models/RecipeItem")["default"]["RawClass"]>} RecipeItem
 */
export default {
    components: {
        EditorHead,
        GraphicViewer,
        SceneSwitcher,
        Tablet,
        Inventory,
        Button,
        SpeechBubbleComponent
    },
    props: {
        model: {
            type: GameSession.RawClass,
            required: true
        },
        showClickAreas: {
            type: Boolean,
            default: false
        },
        preventAutosave: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        scenes() {
            const recipes = this.model.lesson.getRecipes(true);
            const scenes = [...this.model.lesson.scenes];
            for (const recipe of recipes) {
                scenes.push(...recipe.getResources().filter((resource) => resource instanceof Scene.RawClass));
            }
            return uniq(scenes);
        }
    },
    watch: {
        'model.currentScene': {
            async handler(scene) {
                const graphicViewer = this.$refs[`scene_${scene._id}`][0];
                await graphicViewer.initialBackgroundLoadedPromise;
                await Promise.all(graphicViewer.actionObjectsMap.map((item) => item.promise));
                setTimeout(() => graphicViewer.paper.view._windowEvents.resize());
            },
            immediate: false
        },
        'model.knowledgeBase': {
            handler(knowledgeBase) {
                if (this.oldKnowledgeBase && knowledgeBase.length && knowledgeBase.length !== this.oldKnowledgeBase?.length) {
                    this.tippy.setContent(this.$t('addedNewKnowledge'));
                    this.tippy.show();
                }
                this.oldKnowledgeBase = clone(knowledgeBase);
            }
        }
    },
    data() {
        return {
            markedItem: null,
            modelItemMap: new Map(),
            oldKnowledgeBase: null,
            clicks: [],
            inFullscreen: false,
            loading: true
        };
    },
    async mounted() {
        if (!this.model.currentScene) this.model.currentScene = this.model.lesson.scenes[0];
        const inventoryIsFilled = Boolean(this.model.inventory.filter((item) => Boolean(item.object)).length);
        if (!inventoryIsFilled) this.initializeInventory();
        if (!this.preventAutosave) this.onSaveButtonClick();
        this.initOverwriteWatchers();
        window.gamePlayer = this;
        this.$toasted.register("recipe", (recipe) => {
            const parser = new DOMParser();
            const html = parser.parseFromString(`
                <div class="recipeToaster" ref="recipeToaster">
                    <div class="name">${recipe.getName()}</div>
                    <div class="time" style="transition: width ${recipe.transitionSettings.delay}s linear"></div>
                </div>`, "text/html").body.firstElementChild;
            const timeNode = html.getElementsByClassName("time")[0];
            setTimeout(() => { timeNode.style.width = "0%"; }, 10);
            return html;
        }, { type: "info", position: "top-right", className: "recipeToaster" });

        this.tippy = tippy(this.$refs.tablet.$el, {
            appendTo: this.$el,
            content: "",
            placement: "right",
            theme: "material",
            zIndex: 2000,
            showOnCreate: false,
            duration: 300,
            trigger: "",
            onShown: (instance) => {
                setTimeout(instance.hide.bind(instance), 2500);
            }
        });
        const awaitingActionObjects = flatten(this.scenes.map((scene) => this.$refs[`scene_${scene._id}`]).map((graphicViewer) => {
            return graphicViewer[0].actionObjectsMap.map((mapItem) => mapItem.promise);
        }));
        await Promise.all(awaitingActionObjects);
        this.loading = false;
        this.$el.onfullscreenchange = this.onFullscreenChange.bind(this);
        this.$el.requestFullscreen();
    },
    async beforeDestroy() {
        if (!this.preventAutosave) await this.onSaveButtonClick();
        clearTimeout(this.saveTimeout);
        this.tippy.destroy();
    },
    methods: {
        async onSaveButtonClick() {
            if (this.saveTimeout) clearTimeout(this.saveTimeout);
            const result = await this.model.save();
            if (result instanceof Error) {
                this.$toasted.error(this.$t("errorWhileSaving", { name: this.model.getName() }), { className: "errorToaster" });
            } else if (result) this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
            if (!this.preventAutosave) this.saveTimeout = setTimeout(this.onSaveButtonClick.bind(this), 100 * 60 * 5);
        },
        onFullscreenButtonClick() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else this.$el.requestFullscreen();
        },
        onFullscreenChange() {
            if(!document.fullscreenElement) {
                document.body.appendChild(this.$toasted.container);
                this.inFullscreen = false;
            } else {
                this.$el.appendChild(this.$toasted.container);
                this.inFullscreen = true;
            }
        },
        onPreCloseButtonClickConfirm() {
            if (!document.fullscreenElement) return;
            document.exitFullscreen();
        },
        onActionObjectGroupOrClickAreaPrepared(item, model) {
            if (!this.modelItemMap.has(model)) this.modelItemMap.set(model, item);
            const isActivated = this.model.getNormalizedOverwrite(model, "activated");
            const hasAmount = this.model.getNormalizedOverwrite(model, "amount");
            item.visible = isActivated && Boolean(hasAmount);
        },
        onCombineButtonClick(event) {
            if (!this.markedItem) {
                const resources = [...flatten(this.model.grabbing.map((item) => item.getResources()))];
                const recipe = this.model.findRecipes(resources)[0];
                if (recipe) {
                    this.execRecipe(recipe);
                } else this.addPunishPoint();
            } else this.onSceneClick(event, this.markedItem, this.markedItem.model, true);
        },
        onSceneClick(event, item, model, forced) {
            // Stop propagating when it was not a left click
            if (!forced && event && event.event.button > 0) return false;

            // Event bubbled to the whole scene, so the player clicked into the void
            // or tried to make combos which are maybe nonsense
            if (item instanceof Layer) {
                if (this.markedItem) {
                    this.unmarkItem(this.markedItem);
                    this.markedItem = null;
                    return false;
                }
                return this.addPunishPoint();
            }

            // Do not proceed when no model is given because it could be that
            // there is a none model including element which is inside model
            // including element
            if (!model || this.itemIsInvisible(item)) return;

            if (this.markedItem && this.markedItem !== item) {
                this.unmarkItem(this.markedItem);
                this.markedItem = null;
            }

            if (!this.markedItem) {
                this.markItem(item);
                this.markedItem = item;
                return false;
            }

            this.unmarkItem(item);
            this.markedItem = null;

            const resources = [model, ...model.getLabels(), ...flatten(this.model.grabbing.map((item) => item.getResources()))];
            const recipe = this.model.findRecipes(resources)[0];
            if (recipe) {
                this.execRecipe(recipe, model);
            } else this.addPunishPoint();

            return false;
        },
        onWatchChange(model) {
            const item = this.modelItemMap.get(model);
            if (!item) return;
            this.onActionObjectGroupOrClickAreaPrepared(item, model);
        },
        /**
         * @param {Recipe} recipe
         */
        async execRecipe(recipe, clickedModel) {
            this.model.addToProtocol("exec", recipe);
            this.collectItemsByRecipe(recipe);
            await this.awaitRecipeDelay(recipe);
            this.spreadItemsByRecipe(recipe, clickedModel);
            this.model.__ob__.dep.notify();
        },
        awaitRecipeDelay(recipe) {
            const delay = parseInt(recipe.transitionSettings.delay);
            if (!delay || isNaN(delay)) return Promise.resolve();
            this.$toasted.global.recipe(recipe).goAway(delay * 1000);
            return new Promise((resolve) => {
                setTimeout(resolve, delay * 1000);
            });
        },
        collectItemsByRecipe(recipe) {
            for (const recipeItem of recipe.input) {
                const itemOrSpecificObject = this.model.recipeItemToMostSpecificObject(recipeItem, "collect");
                if (itemOrSpecificObject instanceof Item.RawClass) {
                    let inventory = "inventory";
                    if (recipeItem.location === "hand") inventory = "grabbing";
                    const amount = this.model.getOverwrite(recipeItem, "amount") ?? recipeItem.amount;
                    for (let index = 0; index < amount; index++) {
                        this.model.addToProtocol("remove", itemOrSpecificObject.object, inventory === "inventory" ? "inventory" : "hand");
                        this.$refs[inventory].remove(itemOrSpecificObject.object);
                    }
                }
                const objectAmount = this.model.getNormalizedOverwrite(itemOrSpecificObject, "amount");
                const recipeItemAmount = this.model.getOverwrite(recipeItem, "amount") ?? recipeItem.amount;
                if (itemOrSpecificObject instanceof ClickArea.RawClass) {
                    this.model.setOverwrite(itemOrSpecificObject, "amount", objectAmount - recipeItemAmount);
                    for (let index = 0; index < recipeItemAmount; index++) {
                        this.model.addToProtocol("remove", itemOrSpecificObject, "scene");
                    }
                } else if (itemOrSpecificObject instanceof ActionObject.RawClass) {
                    const entity = this.model.getEntity(itemOrSpecificObject);
                    if (!entity) {
                        this.model.setOverwrite(itemOrSpecificObject, "amount", objectAmount - recipeItemAmount);
                        if (recipeItemAmount > 0) this.model.addToProtocol("remove", itemOrSpecificObject, "scene");
                        if (objectAmount - recipeItemAmount <= 0) this.model.addToProtocol("hide", itemOrSpecificObject, "scene");
                    } else if (recipeItemAmount) {
                        entity.currentPhenotype = null;
                        this.model.addToProtocol("hide", itemOrSpecificObject, "scene");
                    }
                    this.onWatchChange(itemOrSpecificObject);
                }
            }
        },
        spreadItemsByRecipe(recipe, clickedModel) {
            for (const recipeItem of recipe.output) {
                const recipeItemObject = this.model.getRealRecipeItemObject(recipeItem);

                if (recipeItemObject instanceof Knowledge.RawClass) {
                    if (!this.model.knowledgeBase.includes(recipeItemObject)) {
                        this.model.knowledgeBase.push(recipeItemObject);
                        this.model.addToProtocol("add", recipeItemObject, "knowledgeBase");
                    }
                } else if (recipeItemObject instanceof Recipe.RawClass) {
                    let resources = null;
                    if (clickedModel) {
                        resources = [clickedModel, ...clickedModel.getLabels(), ...flatten(this.model.grabbing.map((item) => item.getResources()))];
                    }
                    if (this.model.isValidRecipe(recipeItemObject, resources, true)) this.execRecipe(recipeItemObject);
                } else if (recipeItemObject instanceof SpeechBubble.RawClass) {
                    const id = this.model.currentScene._id;
                    const scene = this.$refs[`scene_${id}`][0];
                    const speechBubble = this.$refs[`speechBubble_${id}`][0];
                    speechBubble.show(scene, clickedModel, recipeItemObject);
                } else if (recipeItemObject instanceof File.RawClass) {
                    this.model.addToProtocol("show", recipeItemObject, "tablet");
                    this.$refs.tablet.showingFile = recipeItemObject;
                    this.$refs.tablet.category = "files";
                    this.$refs.tablet.tippy.show();
                } else if (recipeItemObject instanceof Scene.RawClass) {
                    this.model.currentScene = recipeItemObject;
                    this.model.addToProtocol("show", recipeItemObject);
                } else if(["inventory", "hand"].includes(recipeItem.location)) {
                    let objectToAdd = this.model.recipeItemToMostSpecificObject(recipeItem, "spread");
                    if (!objectToAdd) continue;
                    for (let index = 0; index < recipeItem.amount; index++) {
                        if (recipeItem.location === "inventory") {
                            this.$refs.inventory.add(objectToAdd);
                        } else this.$refs.grabbing.add(objectToAdd);
                        this.model.addToProtocol("add", objectToAdd, recipeItem.location === "inventory" ? "inventory" : "hand");
                    }
                } else if (recipeItem.location === "scene") {
                    const entity = this.model.getEntity(recipeItemObject);
                    if (entity) {
                        const newPhenotype = entity.actionObjects.find((actionObject) => {
                            const resources = [actionObject, ...actionObject.getResources()];
                            const labels = actionObject.getLabels();
                            if (!(recipeItemObject instanceof ActionObject.RawClass) && actionObject === clickedModel) return false;
                            return (resources.includes(recipeItemObject) || labels.includes(recipeItemObject));
                        });
                        if (newPhenotype) {
                            const oldPhenotype = entity.currentPhenotype;
                            entity.currentPhenotype = newPhenotype;
                            this.model.addToProtocol("show", newPhenotype, "scene");
                            this.onWatchChange(oldPhenotype);
                            this.onWatchChange(newPhenotype);
                        }
                    } else this.spreadToEntityLessObject(recipeItem, recipeItemObject, clickedModel);
                }
            }
        },
        spreadToEntityLessObject(recipeItem, recipeItemObject, clickedModel) {
            const lesson = this.model.lesson;
            const scenes = lesson.scenes;
            const currentSceneIndex = scenes.indexOf(this.model.currentScene);
            const scenesNumber = scenes.length;
            for (let index = 0; index < scenesNumber; index++) {
                const scene = scenes[(index + currentSceneIndex) % scenesNumber];
                const resources = scene.getResources();
                let specificObject = recipeItemObject;
                if (!(specificObject instanceof ActionObject.RawClass)) {
                    specificObject = lesson.getSpecificObjectsFor(recipeItemObject, resources).filter((specificObject) => {
                        return specificObject !== clickedModel && specificObject instanceof ActionObject.RawClass;
                    })[0];
                }
                if (!specificObject) continue;

                const objectAmount = this.model.getNormalizedOverwrite(specificObject, "amount");
                const recipeItemAmount = this.model.getOverwrite(recipeItem, "amount") ?? recipeItem.amount;
                this.model.setOverwrite(specificObject, "amount", Math.min(1, objectAmount + recipeItemAmount));
                this.model.setOverwrite(specificObject, "activated", true);
                for (let index = 0; index < recipeItemAmount; index++) {
                    this.model.addToProtocol("add", specificObject, "scene");
                }
                this.model.addToProtocol("show", specificObject, "scene");
                break;
            }
        },
        initOverwriteWatchers() {
            for (const scene of this.model.lesson.scenes) {
                const resources = scene.getResources().filter((resource) => {
                    return !(resource instanceof Label.RawClass) && !(resource instanceof SceneObject.RawClass);
                });
                for (const resource of resources) {
                    const entity = this.model.getEntity(resource);
                    let path = "";
                    if (entity) {
                        const bucket = entity.getBestBucket(resource);
                        const entityIndex = this.model.entities.indexOf(entity);
                        path = `model.entities.${entityIndex}.overwrites.${bucket}`;
                    } else path = `model.overwrites.${resource._id}`;
                    const amountPath = `${path}.amount`;
                    this.$watch(amountPath, () => this.onWatchChange(resource));
                }
            }
        },
        getItemBoundary(item) {
            return item.children.filter((child) => child.name === "boundary")[0];
        },
        unmarkItem(item) {
            let mark = item;
            if (item instanceof Group) mark = this.getItemBoundary(item);
            mark.strokeColor = null;
            mark.strokeWidth = 0;
            mark.opacity = 0.01;
        },
        markItem(item) {
            let mark = item;
            if (item instanceof Group) mark = this.getItemBoundary(item);
            mark.strokeColor = "red";
            mark.strokeWidth = 3;
            mark.opacity = 1;
        },
        initializeInventory() {
            for (const itemSubObject of this.model.lesson.inventory) {
                const amount = this.model.lesson.overwrites?.[itemSubObject._id]?.amount || 1;
                for (let index = 0; index < amount; index++) {
                    this.$refs.inventory.add(itemSubObject);
                }
            }
        },
        itemIsInvisible(item) {
            if (!item) return false;
            if (!item.opacity) return true;
            if (!item.visible) return true;
            return this.itemIsInvisible(item.parent);
        },
        addPunishPoint() {
            const lesson = this.model.lesson;
            if (!lesson.punishClicks || !lesson.punishSeconds || !lesson.punishPoints) return;
            this.clicks.push(new Date());
            if (this.clicks.length < lesson.punishClicks) return;
            if (this.clicks.length > lesson.punishClicks) this.clicks.shift();
            if ((this.clicks[lesson.punishClicks - 1] - this.clicks[0]) < lesson.punishSeconds * 1000) {
                this.model.punishments++;
                this.tippy.setContent(this.$t('addedPunishment'));
                this.tippy.show();
            }
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Player.less"></style>
