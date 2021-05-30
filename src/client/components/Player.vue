<template>
    <div class="player">
        <EditorHead :name="model.lesson.name" :model="model" :nameIsTranslated="true" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <section v-for="scene in model.lesson.scenes" :key="scene._id">
            <GraphicViewer
                :model="scene"
                :showClickAreas="showClickAreas"
                :adjustToBorder="true"
                :clickFunction="onSceneClick"
                v-if="model.currentScene === scene"
            />
        </section>
        <Button ref="sceneSwitcherButton" class="button sceneSwitcher" name="scenes" :showLabel="false" @click.prevent.stop="onSceneButtonClick($event)">
            <theater-icon />
        </Button>
        <section class="protocol"></section>
        <Inventory :model="model" ref="grabbing" :field="'grabbing'" :minimumSlots="0" class="grabbing" />
        <Inventory :model="model" ref="inventory" />
        <VueSimpleContextMenu
            :ref="'sceneSwitcherPopup'"
            :elementId="'sceneSwitcherPopup'"
            :options="scenes"
            @option-clicked="onSceneSelect"
        />
    </div>
</template>

<script>
import GraphicViewer from "~client/components/GraphicViewer";
import EditorHead from "~client/components/EditorHead";
import Button from "~client/components/Button";
import GameSession from "~client/models/GameSession";

import 'vue-simple-context-menu/dist/vue-simple-context-menu.css';
import VueSimpleContextMenu from 'vue-simple-context-menu';
import Inventory from "~client/components/Inventory";
import { Layer, Group } from "paper";

export default {
    components: {
        EditorHead,
        Button,
        GraphicViewer,
        VueSimpleContextMenu,
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
            scenes: this.model.lesson.scenes.map((scene) => {
                return { name: scene.getName(), scene };
            }),
            markedItem: null
        };
    },
    mounted() {
        if (!this.model.currentScene) this.model.currentScene = this.model.lesson.scenes[0];
        const inventoryIsFilled = Boolean(this.model.inventory.filter((item) => Boolean(item.object)).length);
        if (!inventoryIsFilled) this.initializeInventory();
        if (!this.preventAutosave) this.onSaveButtonClick();
    },
    async beforeDestroy() {
        if (!this.preventAutosave) await this.onSaveButtonClick();
        clearTimeout(this.saveTimeout);
    },
    methods: {
        onSceneButtonClick(event) {
            this.$refs.sceneSwitcherPopup.showMenu(event, this.$refs.sceneSwitcherButton.$el);
        },
        onSceneSelect(event) {
            this.model.currentScene = event.option.scene;
        },
        async onSaveButtonClick() {
            if (this.saveTimeout) clearTimeout(this.saveTimeout);
            const result = await this.model.save();
            if (result instanceof Error) {
                this.$toasted.error(this.$t("errorWhileSaving", { name: this.model.getName() }), { className: "errorToaster" });
            } else if (result) this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
            if (!this.preventAutosave) this.saveTimeout = setTimeout(this.onSaveButtonClick.bind(this), 100 * 60 * 5);
        },
        onSceneClick(event, item, model) {
            if (this.markedItem && this.markedItem !== item && !this.itemIsInItem(this.markedItem, item)) {
                this.unmarkItem(this.markedItem);
                this.markedItem = null;
                if (item instanceof Layer) return false;
            }

            // Stop propagating when it was not a left click
            if (event && event.event.button > 0) return false;

            // Event bubbled to the whole scene, so the player clicked into the void
            // or tried to make combos which are maybe nonsense
            if (item instanceof Layer) {
                this.unmarkItem(this.markedItem);
                this.markedItem = null;
                return this.addPunishPoint();
            }

            // Do not proceed when no model is given because it could be that
            // there is a none model including element which is inside model
            // including element
            if (!model || this.itemIsInvisible(item)) return;

            if (!this.markedItem) {
                this.markItem(item);
                this.markedItem = item;
                return false;
            }
            const recipes = this.searchRecipe(model);

            if (recipes.length) {
                console.log(recipes);
                // recipe.exec();
                // Stop propagation if a recipe was found which means return false
                return false;
            }
        },
        itemIsInItem(item, container) {
            if (!item.parent) return false;
            if (item.parent === container) return true;
            return this.itemIsInItem(item.parent, container);
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
