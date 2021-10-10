<template>
    <div>
        <div class="speechBubble" ref="speechBubble" :style="`top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px`"></div>
        <div class="speechBubblePopup" ref="speechBubblePopup">
            <div v-if="model">
                <div class="closeButton" @click="close">
                    <close-icon />
                </div>
                <div class="speech"><pre>{{ content }}</pre></div>
                <div class="button" v-if="hasNextBubble" @click="next">{{ $t('next') }}</div>
                <div class="button" v-else @click="finish">{{ $t('finish') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import tippy, {sticky} from "tippy.js";
import { unescape } from "~common/utils";
import GameSession from "~client/models/GameSession";
import TemplateLiterals from "~client/lib/TemplateLiterals";

export default {
    props: {
        session: {
            type: GameSession.RawClass,
            required: true
        },
        execRecipeFunc: {
            type: Function,
            required: true
        }
    },
    computed: {
        hasNextBubble() {
            return this.model.recipe && this.model.recipe.output.some((recipeItem) => recipeItem.speechBubble);
        },
        content() {
            if (this.error) return this.error;
            if (this.preparedContent) return this.preparedContent;

            const userLangString = `${this.property}_${window.activeUser.locale}`;
            const fallbackString = `${this.property}_en-us`;
            const templateLiterals = new TemplateLiterals(this.session, this.model);

            try {
                const result = templateLiterals.parseTemplate(this.model[userLangString] || this.model[fallbackString]);
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                this.preparedContent = result;
                return result;
            } catch (error) {
                return this.$t('somethingWentWrong', {
                    adminMail: window.process.environment.APP_MAINTAINER_MAIL,
                    error: error.toString()
                });
            }
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
            preparedContent: null,
            property: "description",
            error: null
        };
    },
    mounted() {
        window.addEventListener("resize", () => {
            if (!this.tippy || !this.tippy.state.isVisible) return;
            Object.assign(this, this.calcSizes());
        });
    },
    methods: {
        calcSizes() {
            if (this.sceneItem) {
                const viewCoords = this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topLeft);
                const width = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.topRight).subtract(viewCoords).length);
                const height = Math.round(this.sceneItem.parent.localToGlobal(this.sceneItem.bounds.bottomLeft).subtract(viewCoords).length);
                const top = Math.round(viewCoords.y) + 55;
                const left = Math.round(viewCoords.x);
                return { width, height, top, left };
            }
            return {
                width: 0,
                height: 0,
                top: Math.round(this.$parent.$el.offsetHeight / 2),
                left: Math.round(this.$parent.$el.offsetWidth / 2)
            };
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
        async next(recipe) {
            if (!recipe || recipe instanceof Event) recipe = this.model.recipe;
            if (!recipe) return;
            if (!window.activeUser.editingModel.isValidRecipe(recipe, null, true)) {
                this.preparedContent = null;
                this.property = "error";
            } else {
                try {
                    await this.execRecipeFunc(recipe, this.sceneItem?.model);
                    this.property = "description";
                } catch (error) {
                    this.error = error.toString();
                }
            }
        },
        async finish() {
            await this.next();
            /** @type {string} */
            const userLangString = `${this.property}_${window.activeUser.locale}`;
            const fallbackString = `${this.property}_en-us`;
            const stringToDisplay = unescape(this.model[userLangString] || this.model[fallbackString]);
            if (this.error || this.property === "error") {
                if (!stringToDisplay && !this.error) {
                    this.$toasted.error(this.$t('invalidRecipe'));
                    this.hide();
                }
            } else this.hide();
        },
        async close() {
            if (this.model.exitRecipe) await this.next(this.model.exitRecipe);
            this.hide();
        },
        show(scene, clickedModel, speechBubbleModel) {
            this.preparedContent = null;
            this.model = speechBubbleModel;
            this.createTippy();
            const project = scene.paper.project;
            if (clickedModel) {
                this.sceneItem = project.activeLayer.getItem((item) => item.model === clickedModel);
            } else this.sceneItem = null;
            Object.assign(this, this.calcSizes());
            setTimeout(this.tippy.show.bind(this.tippy));
        },
        hide() {
            this.sceneItem = null;
            this.model = null;
            this.error = null;
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/SpeechBubble.less"></style>
