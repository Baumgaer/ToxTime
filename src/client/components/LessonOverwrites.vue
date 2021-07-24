<template>
    <div class="lessonsOverwrites">
        <div class="lessonsOverwritesAnchor" ref="tippyReference"></div>
        <div class="lessonsOverwritesContent" ref="tippyContent">
            <div class="head">
                <close-icon @click="hide" />
            </div>
            <div class="body">
                <lesson-overwrites-item :model="model" :lesson="lesson" :showSubObjects="true" />
            </div>
        </div>
    </div>
</template>

<script>
import Lesson from "~client/models/Lesson";
import ClientModel from "~client/lib/ClientModel";

import LessonOverwritesItem from "~client/components/LessonOverwritesItem";
import tippyJS, { sticky, hideAll } from "tippy.js";

export default {
    components: {
        LessonOverwritesItem
    },
    props: {
        lesson: {
            type: Lesson.RawClass,
            required: true
        },
        model: {
            type: ClientModel,
            required: true
        }
    },
    data() {
        return {
            lastAttachPoint: null
        };
    },
    mounted() {
        const editorBody = this.$parent.$refs.editorBody;
        editorBody.appendChild(this.$refs.tippyReference);
        this.tippy = tippyJS(this.$refs.tippyReference, {
            appendTo: this.$root.$el,
            content: this.$refs.tippyContent,
            theme: "material lessonOverwrites",
            showOnCreate: false,
            arrow: true,
            sticky: true,
            interactive: true,
            interactiveBorder: 20,
            plugins: [sticky],
            hideOnClick: false,
            zIndex: 10,
            trigger: "manual",
            placement: "auto",
            onHidden: () => hideAll(this.tippy)
        });
    },
    methods: {

        /**
         * @param {Event} event
         */
        updatePosition(event) {
            setTimeout(() => {
                const ele = this.$refs.tippyReference;
                let attachPoint = event.target;
                if (["scroll", "wheel"].includes(event.type)) {
                    if (!this.lastAttachPoint) return;
                    attachPoint = this.lastAttachPoint;
                }
                this.lastAttachPoint = attachPoint;
                const parentRect = this.$parent.$refs.editorBody.getBoundingClientRect();
                const rect = attachPoint.getBoundingClientRect();
                ele.style.top = `${rect.top - parentRect.top + 50}px`;
                ele.style.left = `${rect.left - parentRect.left}px`;
                ele.style.width = `${rect.width}px`;
                ele.style.height = `${rect.height}px`;
                this.tippy.show();
            }, 50);
        },

        hide() {
            this.tippy.hide();
            this.model.isSelected = false;
            this.lastAttachPoint = null;
        },

        openItemSelector(name) {
            this.itemSelector = name;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonOverwrites.less"></style>
