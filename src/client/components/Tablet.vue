<template>
    <div class="tablet">
        <div class="button" ref="button"><tablet-android-icon /></div>
        <div class="device" ref="device">
            <div class="screen">
                <nav>
                    <Button :name="'information'" :active="category === 'information'" @click="onNavButtonClick('information')">
                        <information-icon />
                    </Button>
                    <Button :name="'knowledge'" :active="category === 'knowledge'" @click="onNavButtonClick('knowledge')">
                        <head-lightbulb-icon />
                    </Button>
                    <Button :name="'notes'" :active="category === 'notes'" @click="onNavButtonClick('notes')">
                        <notebook-icon />
                    </Button>
                    <Button :name="'files'" :active="category === 'files'" @click="onNavButtonClick('files')">
                        <file-document-icon />
                    </Button>
                </nav>
                <main>
                    <section v-show="category === 'information'">
                        {{ model.lesson.description }}
                    </section>
                </main>
            </div>
            <div class="button" @click="onDeviceButtonClick"></div>
        </div>
    </div>
</template>

<script>
import GameSession from "~client/models/GameSession";

import Button from "~client/components/Button";

import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

export default {
    components: {
        Button
    },
    props: {
        model: {
            type: GameSession.RawClass,
            required: true
        }
    },
    data() {
        return {
            category: "information"
        };
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
        onNavButtonClick(category) {
            this.category = category;
        },
        onDeviceButtonClick() {
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Tablet.less"></style>
