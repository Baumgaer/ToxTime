<template>
    <div class="player" @contextmenu.prevent.stop="clearHand">
        <EditorHead :name="model.lesson.name" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <section v-for="scene in model.lesson.scenes" :key="scene._id">
            <GraphicViewer
                :model="scene"
                :showClickAreas="false"
                :adjustToBorder="true"
                v-if="model.currentScene === scene"
            />
        </section>
        <Button ref="sceneSwitcherButton" class="button sceneSwitcher" name="scenes" :showLabel="false" @click.prevent.stop="onSceneButtonClick($event)">
            <theater-icon />
        </Button>
        <section class="protocol"></section>
        <section class="inventory" ref="inventory" @wheel="onInventoryScroll($event)">
            <div v-for="(item, index) in model.inventory"
                 :key="index"
                 class="slot"
                 :style="`background-image: url('${item.getAvatar().name}')`"
                 :title="item.getName()"
                 @click.prevent.stop="onInventorySlotClick(item)"
            >
                <div class="amount" v-if="item.amount">{{ item.amount }}</div>
            </div>
        </section>
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
import Item from "~client/models/Item";
import ApiClient from "~client/lib/ApiClient";

import 'vue-simple-context-menu/dist/vue-simple-context-menu.css';
import VueSimpleContextMenu from 'vue-simple-context-menu';

export default {
    components: {
        EditorHead,
        Button,
        GraphicViewer,
        VueSimpleContextMenu
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
            this.addToInventory(itemSubObject);
        }

        if (this.model.inventory.length < 10) {
            for (let index = this.model.inventory.length; index < 10; index++) {
                this.addToInventory(null);
            }
        }
    },
    methods: {
        onInventoryScroll(event) {
            this.$refs.inventory.scrollLeft -= (event.wheelDelta);
            event.preventDefault();
        },
        onInventorySlotClick(item) {
            if (!item.amount) return;
            this.grabFromInventory(item);
        },
        onSceneButtonClick(event) {
            this.$refs.sceneSwitcherPopup.showMenu(event, this.$refs.sceneSwitcherButton.$el);
        },
        onSceneSelect(event) {
            this.model.currentScene = event.option.scene;
        },
        onSaveButtonClick() {
            console.log("SAVED");
        },
        nextEmptyInventorySlot(name = "inventory") {
            for (let index = 0; index < this.model[name].length; index++) {
                const item = this.model[name][index];
                if (!item.amount) return index;
            }
            return -1;
        },
        nextCorrespondingStack(obj, name = "inventory") {
            for (const item of this.model[name]) {
                if (item.object === obj) return item;
            }
            return null;
        },
        addToInventory(obj, name = "inventory") {
            if (!obj) {
                this.model[name].push(ApiClient.store.addModel(new Item.Model({ amount: 0 })));
                return;
            }
            const nextEmptySlot = this.nextEmptyInventorySlot(name);
            const nextStack = this.nextCorrespondingStack(obj, name);

            if (nextStack) {
                nextStack.amount++;
            } else if (nextEmptySlot >= 0) {
                const item = this.model[name][nextEmptySlot];
                item.object = obj;
                item.amount++;
            } else {
                const item = ApiClient.store.addModel(new Item.Model());
                item.object = obj;
                this.model[name].push(item);
            }
        },
        grabFromInventory(item) {
            item.amount--;
            this.addToInventory(item.object, "grabbing");
            if (!item.amount) item.object = null;
        },
        clearHand() {
            for (const item of this.model.grabbing) {
                for (let index = 0; index < item.amount; index++) {
                    this.addToInventory(item.object);
                }
            }
            this.model.grabbing.splice(0, this.model.grabbing.length);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Player.less"></style>
