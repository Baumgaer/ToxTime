<template>
    <div class="tablet">
        <div class="button" ref="button"><tablet-android-icon /></div>
        <div class="device" ref="device">
            <div class="screen"></div>
            <div class="button" @click="onDeviceButtonClick"></div>
        </div>
    </div>
</template>

<script>
import GameSession from "~client/models/GameSession";

import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

export default {
    props: {
        model: {
            type: GameSession.RawClass,
            required: true
        }
    },
    mounted() {
        this.tippy = tippy(this.$refs.button, {
            appendTo: this.$root.$el,
            content: this.$refs.device,
            placement: "auto",
            theme: "material tablet",
            interactive: true,
            interactiveBorder: 20,
            zIndex: 20,
            hideOnClick: true,
            trigger: "click",
            showOnCreate: false
        });
    },
    methods: {
        onDeviceButtonClick() {
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Tablet.less"></style>
