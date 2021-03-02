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
        <Button class="button sceneSwitcher" name="scenes" :showLabel="false" @click="onSceneButtonClick($event)">
            <theater-icon />
        </Button>
        <section class="protocol"></section>
        <section class="inventory">
            <div class="slot" v-for="item in model.inventory" :key="item._id" :style="`background-image: url('${item.getAvatar()}')`" @click="onInventorySlotClick($event, item)">
                <div class="amount">{{ item.amount }}</div>
            </div>
        </section>
    </div>
</template>

<script>
import GraphicViewer from "~client/components/GraphicViewer";
import EditorHead from "~client/components/EditorHead";
import Button from "~client/components/Button";
import GameSession from "~client/models/GameSession";

export default {
    components: {
        EditorHead,
        Button,
        GraphicViewer
    },
    props: {
        model: {
            type: GameSession.RawClass,
            required: true
        }
    },
    mounted() {
        this.model.currentScene = this.model.lesson.scenes[0];
    },
    methods: {
        onInventorySlotClick(event, item) {
            console.log(event, item);
        },
        onSceneButtonClick(event) {
            console.log(event);
        },
        onSaveButtonClick() {
            console.log("SAVED");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Player.less"></style>
