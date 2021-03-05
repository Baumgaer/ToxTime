<template>
    <div class="player">
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
        <section class="inventory">
            <div class="slot" v-for="item in model.inventory" :key="item._id" :style="`background-image: url('${item.getAvatar()}')`" @click="onInventorySlotClick($event, item)">
                <div class="amount">{{ item.amount }}</div>
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
    },
    methods: {
        onInventorySlotClick(event, item) {
            console.log(event, item);
        },
        onSceneButtonClick(event) {
            this.$refs.sceneSwitcherPopup.showMenu(event, this.$refs.sceneSwitcherButton.$el);
        },
        onSceneSelect(event) {
            this.model.currentScene = event.option.scene;
        },
        onSaveButtonClick() {
            console.log("SAVED");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Player.less"></style>
