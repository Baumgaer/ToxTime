<template>
    <div class="sceneSwitcher">
        <div ref="button" class="button"><theater-icon /></div>
        <div ref="content">
            <Item v-for="scene of model.lesson.scenes"
                  :key="scene._id"
                  draggable="false"
                  :model="scene"
                  :showTooltip="false"
                  :showSubObjects="false"
                  :compactMode="true"
                  @click="onSceneSelect(scene)"
            />
        </div>
    </div>
</template>

<script>
import GameSession from "~client/models/GameSession";

import Item from "~client/components/Item";

import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

export default {
    components: {
        Item
    },
    props: {
        model: {
            type: GameSession.RawClass,
            required: true
        }
    },
    mounted() {
        this.tippy = tippy(this.$refs.button, {
            appendTo: this.$parent.$el,
            content: this.$refs.content,
            placement: "auto",
            theme: "material",
            interactive: true,
            interactiveBorder: 20,
            zIndex: 20,
            hideOnClick: true,
            trigger: "click",
            showOnCreate: false
        });
    },
    methods: {
        onSceneSelect(scene) {
            this.model.currentScene = scene;
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/SceneSwitcher.less"></style>
