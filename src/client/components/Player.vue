<template>
    <div class="player" @contextmenu.prevent.stop="$refs.inventory.clearHand" @mousemove.prevent.stop="adjustGrabbingPosition($event)">
        <EditorHead :name="model.lesson.name" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
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
        <Inventory :model="model" ref="inventory" />
        <Inventory :model="model" ref="grabbing" :field="'grabbing'" :minimumSlots="0" class="grabbing" />
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
        this.model.currentScene = this.model.lesson.scenes[0];

        for (const itemSubObject of this.model.lesson.inventory) {
            const model = this.model;
            const alreadyInInventory = model.inventory.find((item) => item?.object?._id === itemSubObject._id);
            if (alreadyInInventory) continue;
            this.$refs.inventory.add(itemSubObject);
        }
    },
    methods: {
        onSceneButtonClick(event) {
            this.$refs.sceneSwitcherPopup.showMenu(event, this.$refs.sceneSwitcherButton.$el);
        },
        onSceneSelect(event) {
            this.model.currentScene = event.option.scene;
        },
        onSaveButtonClick() {
            console.log("SAVED");
        },
        onSceneClick(event, item, model) {
            // Event bubbled to the whole scene, so the player clicked into the void
            // or tried to make combos which are maybe nonsense
            if (item instanceof Layer) return this.addPunishPoint();

            // Stop propagating when it was not a left click
            if (event.event.button) return false;

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
        itemIsInvisible(item) {
            if (!item) return false;
            if (!item.opacity) return true;
            return this.itemIsInvisible(item.parent);
        },
        adjustGrabbingPosition(event) {
            this.$refs.grabbing.$el.style.top = (event.pageY + 15) + "px";
            this.$refs.grabbing.$el.style.left = (event.pageX + 15) + "px";
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
