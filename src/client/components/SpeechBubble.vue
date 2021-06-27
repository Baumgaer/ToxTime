<template>
    <div>
        <div class="speechBubble" ref="speechBubble" :style="`top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px`"></div>
        <div class="speechBubblePopup" ref="speechBubblePopup" v-show="sceneItem">
            <div v-if="model">
                <div class="closeButton" @click="hide">
                    <close-icon />
                </div>
                <div class="speech">{{ model[`${property}_${window.activeUser.locale}`] }}</div>
                <div class="button" v-if="model.recipe" @click="next">{{ $t('next') }}</div>
                <div class="button" v-else @click="hide">{{ $t('finish') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import tippy, {sticky} from "tippy.js";

export default {
    props: {
        execRecipeFunc: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            tippy: null,
            sceneItem: null,
            model: null,
            property: "description"
        };
    },
    mounted() {
        window.addEventListener("resize", () => {
            if (!this.tippy || !this.sceneItem || !this.tippy.state.isVisible) return;
            Object.assign(this, this.calcSizes());
        });
    },
    methods: {
        calcSizes() {
            if (!this.sceneItem) return;
            const viewCoords = this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topLeft);
            const width = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topRight).subtract(viewCoords).length);
            const height = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.bottomLeft).subtract(viewCoords).length);
            const top = Math.round(viewCoords.y) + 55;
            const left = Math.round(viewCoords.x);
            return { width, height, top, left };
        },
        createTippy() {
            if (this.tippy) return;
            this.tippy = tippy(this.$refs.speechBubble, {
                appendTo: this.$parent.$el,
                content: this.$refs.speechBubblePopup,
                placement: "auto-start",
                theme: "material",
                sticky: true,
                interactive: true,
                hideOnClick: false,
                interactiveBorder: 20,
                plugins: [sticky],
                zIndex: 20,
                trigger: "manual",
                showOnCreate: false
            });
        },
        async next() {
            if (!window.activeUser.editingModel.isValidRecipe(this.model.recipe)) {
                this.property = "error";
            } else {
                try {
                    await this.execRecipeFunc(this.model.recipe, this.sceneItem.model);
                    this.property = "description";
                } catch (_error) {
                    this.property = "error";
                }
            }
        },
        show(scene, clickedModel, speechBubbleModel) {
            this.model = speechBubbleModel;
            this.createTippy();
            const project = scene.paper.project;
            this.sceneItem = project.activeLayer.getItem((item) => item.model === clickedModel);
            if (!this.sceneItem) return;
            Object.assign(this, this.calcSizes());
            setTimeout(this.tippy.show.bind(this.tippy));
        },
        hide() {
            this.sceneItem = null;
            this.model = null;
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/SpeechBubble.less"></style>
