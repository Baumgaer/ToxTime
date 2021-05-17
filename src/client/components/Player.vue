<template>
    <div class="player">
        <EditorHead :name="model.lesson.name" :model="model" :nameIsTranslated="true" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <section v-for="scene in model.lesson.scenes" :key="scene._id">
            <GraphicViewer
                :model="scene"
                :showClickAreas="false"
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
import { Layer } from "paper";

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
        preventAutosave: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            scenes: this.model.lesson.scenes.map((scene) => {
                return { name: scene.getName(), scene };
            })
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
            // Stop propagating when it was not a left click
            if (event.event.button > 0) return false;

            // Event bubbled to the whole scene, so the player clicked into the void
            // or tried to make combos which are maybe nonsense
            if (item instanceof Layer) return this.addPunishPoint();

            // Do not proceed when no model is given because it could be that
            // there is a none model including element which is inside model
            // including element
            if (!model || this.itemIsInvisible(item)) return;
            const recipe = this.searchRecipe(model);

            if (recipe) {
                recipe.exec();
                // Stop propagation if a recipe was found which means return false
                return false;
            }
        },
        initializeInventory() {
            for (const itemSubObject of this.model.lesson.inventory) {
                this.$refs.inventory.add(itemSubObject);
            }
        },
        itemIsInvisible(item) {
            if (!item) return false;
            if (!item.opacity) return true;
            return this.itemIsInvisible(item.parent);
        },
        searchRecipe(model) {
            console.log("searching for Recipe with model:", model);
        },
        addPunishPoint() {
            console.log("PUNISHED");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Player.less"></style>
