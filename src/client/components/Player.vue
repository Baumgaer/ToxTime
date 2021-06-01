<template>
    <div class="player">
        <EditorHead :name="model.lesson.name" :model="model" :nameIsTranslated="true" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <section v-for="scene in model.lesson.scenes" :key="scene._id">
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
        </section>
        <section class="protocol"></section>
        <Inventory :model="model" ref="grabbing" :field="'grabbing'" :minimumSlots="0" class="grabbing" />
        <Inventory :model="model" ref="inventory" />
        <SceneSwitcher class="sceneSwitcher" :model="model" />
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

import SceneSwitcher from "~client/components/SceneSwitcher";
import Inventory from "~client/components/Inventory";
import { Layer, Group } from "paper";
import { makeId, flatten, uniq } from "~common/utils";

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
        Inventory
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
    data() {
        return {
            markedItem: null,
            modelItemMap: new Map()
        };
    },
    beforeMount() {
        this.model.cacheHash = makeId(10);
    },
    mounted() {
        if (!this.model.currentScene) this.model.currentScene = this.model.lesson.scenes[0];
        const inventoryIsFilled = Boolean(this.model.inventory.filter((item) => Boolean(item.object)).length);
        this.initOverwriteWatchers();
        if (!inventoryIsFilled) this.initializeInventory();
        if (!this.preventAutosave) this.onSaveButtonClick();
        window.gamePlayer = this;
    },
    async beforeDestroy() {
        if (!this.preventAutosave) await this.onSaveButtonClick();
        clearTimeout(this.saveTimeout);
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
        onActionObjectGroupOrClickAreaPrepared(item, model) {
            if (!this.modelItemMap.has(model)) this.modelItemMap.set(model, item);
            const isActivated = this.model.getOverwriteValue(model._id, "activated");
            const hasAmount = this.model.getOverwriteValue(model._id, "amount");
            item.visible = isActivated && Boolean(hasAmount);
        },
        onSceneClick(event, item, model) {
            // Stop propagating when it was not a left click
            if (event && event.event.button > 0) return false;

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

            const recipes = this.searchRecipe(model);
            if (recipes.length) {
                const resources = this.model.getResources([model]);
                for (const recipe of recipes) {
                    this.execRecipe(recipe, resources);
                }
            } else this.addPunishPoint();

            return false;
        },
        onWatchChange(model) {
            const item = this.modelItemMap.get(model);
            this.onActionObjectGroupOrClickAreaPrepared(item, model);
        },
        /**
         * @param {Recipe} recipe
         * @param {Array<GameObject | Label | Knowledge | File>} resources
         */
        execRecipe(recipe) {
            /** @type {RecipeItem[]} */
            const amountCorrect = recipe.input.every((recipeItem) => {
                const itemOrSpecificObject = this.getItemFor(recipeItem);
                if (itemOrSpecificObject instanceof Knowledge.RawClass) return true;
                if (itemOrSpecificObject instanceof Item.RawClass) return itemOrSpecificObject.amount >= recipeItem.amount;
                let amount = this.model.getOverwriteValue(itemOrSpecificObject._id, "amount");
                return amount >= recipeItem.amount;
            });

            if (!amountCorrect) return;

            // Collect items
            for (const recipeItem of recipe.input) {
                const itemOrSpecificObject = this.getItemFor(recipeItem);
                if (itemOrSpecificObject instanceof Item.RawClass) {
                    let inventory = "inventory";
                    if (recipeItem.location === "hand") inventory = "grabbing";
                    for (let index = 0; index < recipeItem.amount; index++) {
                        this.$refs[inventory].remove(itemOrSpecificObject.object);
                    }
                }
                if (itemOrSpecificObject instanceof ActionObject.RawClass || itemOrSpecificObject instanceof ClickArea.RawClass) {
                    const overwrite = this.model.getOverwrite(itemOrSpecificObject._id);
                    overwrite.amount -= recipeItem.amount;
                    if (overwrite.amount <= 0) overwrite.activated = false;
                }
            }

            // Give items or exec functionality
            for (const recipeItem of recipe.output) {
                if (recipeItem.object instanceof Knowledge.RawClass) {
                    this.model.knowledgeBase.push(recipeItem.object);
                } else if (recipeItem.object instanceof File.RawClass) {
                    console.log("SHOW POPUP");
                } else if (recipeItem.object instanceof Scene.RawClass) {
                    this.model.currentScene = recipeItem.object;
                } else if(["inventory", "hand"].includes(recipeItem.location)) {
                    let objectToAdd = recipeItem.object;
                    if (recipeItem.object instanceof Label.RawClass) {
                        objectToAdd = this.model.lesson.getSpecificObjectsFor(this.model.getRecipeObject(recipeItem), this.model.currentScene.getResources(this.model.cacheHash))[0];
                    }
                    if (!objectToAdd) continue;
                    if (recipeItem.location === "inventory") {
                        this.$refs.inventory.add(objectToAdd);
                    } else this.$refs.grabbing.add(objectToAdd);
                } else if (recipeItem.location === "scene") {
                    console.log("assume object and display it");
                }
            }
        },
        /**
         * @param {RecipeItem} recipeItem
         */
        getItemFor(recipeItem) {
            let recipeResources;
            let locationToGetItemFrom;
            if (recipeItem.object instanceof Knowledge.RawClass) return recipeItem.object;

            if (recipeItem.location === "scene") {
                recipeResources = this.model.currentScene.getResources(this.model.cacheHash);
                locationToGetItemFrom = "currentScene";
            }
            if (recipeItem.location === "hand") {
                recipeResources = flatten(this.model.grabbing.map((item) => item.getResources(this.model.cacheHash)));
                locationToGetItemFrom = "grabbing";
            }
            if (recipeItem.location === "inventory") {
                recipeResources = flatten(this.model.inventory.map((item) => item.getResources(this.model.cacheHash)));
                locationToGetItemFrom = "inventory";
            }

            let specificObjects = this.model.lesson.getSpecificObjectsFor(this.model.getRecipeObject(recipeItem), uniq(recipeResources));
            if (!specificObjects.length) {
                specificObjects = recipeResources.filter((resource) => {
                    const recipeItemObject = this.model.getRecipeObject(recipeItem);
                    if (recipeItemObject instanceof Label.RawClass) return resource.getLabels().includes(recipeItemObject);
                    return resource === recipeItemObject;
                });
            }

            if (locationToGetItemFrom === "currentScene") return specificObjects[0];
            return this.model[locationToGetItemFrom].find((item) => item.object === specificObjects[0]);
        },
        initOverwriteWatchers() {
            for (const scene of this.model.lesson.scenes) {
                const resources = scene.getResources(this.model.cacheHash).filter((resource) => !(resource instanceof Label.RawClass));
                for (const resource of resources) {
                    const objPath = `model.overwrites.${resource._id}`;
                    const sessionOverwrite = this.model.getOverwrite(resource._id);
                    sessionOverwrite.activated = this.model.getOverwriteValue(resource._id, "activated");
                    sessionOverwrite.amount = this.model.getOverwriteValue(resource._id, "amount");

                    this.$watch(`${objPath}.activated`, () => this.onWatchChange(resource));
                    this.$watch(`${objPath}.amount`, () => this.onWatchChange(resource));
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
        searchRecipe(model) {
            const resources = this.model.getResources([model]);
            return this.model.findRecipes(resources);
        },
        addPunishPoint() {
            console.log("PUNISHED");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Player.less"></style>
