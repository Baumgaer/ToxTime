<template>
    <div class="avatar" v-on="$listeners">
        <div class="ratio" v-if="hasAvatar" :title="avatar.title" ref="ratio">
            <div v-if="hasImageAvatar" class="picture" :style="`background-image: url(${avatar.name});${fitImage ? 'background-size: contain;' : ''}`"></div>
            <component v-else :is="avatar.name" class="picture" :title="avatar.title"></component>
            <div class="overlayIcons" v-if="overlayIcons" ref="overlayIcons">
                <component v-for="overlayIcon of overlayIcons.split(' ')" :is="overlayIcon" :key="overlayIcon" class="overlayIcon"></component>
            </div>
        </div>
        <div class="slot">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";

export default {
    props: {
        model: {
            type: ClientModel,
            required: true
        },
        overlayIcons: String,
        fitImage: {
            type: Boolean,
            default: false
        },
        ratio: {
            type: String,
            default: "auto",
            validator(value) {
                if (value === "auto") return true;
                if (value.match(/:/g).length === 1) {
                    const ratioValues = value.split(":");
                    if (ratioValues.length === 2 && ratioValues[0]) return true;
                }
                return false;
            }
        }
    },
    computed: {
        avatar() {
            return this.model.getAvatar();
        },

        hasAvatar() {
            return Boolean(this.avatar);
        },

        hasImageAvatar() {
            const avatarData = this.model.getAvatar();
            if (!avatarData) return false;
            if (avatarData.type === "image") return true;
            return false;
        }
    },
    mounted() {
        this.determineRatioType();
        this.setFontSize();
    },
    methods: {
        determineRatioType() {
            if (this.ratio !== "auto") {
                this.setGivenRatio();
            } else this.setAutoRatio();
        },

        setGivenRatio() {
            if (!this.hasImageAvatar) return;
            const [left, right] = this.ratio.split(":");
            this.$refs.ratio.style.setProperty("padding-top", `${(parseInt(right) / parseInt(left)) * 100}%`);
        },

        setAutoRatio() {
            if (!this.hasAvatar || !this.hasImageAvatar) return;
            const image = new Image();
            const that = this;
            image.onload = function() {
                that.$refs.ratio.style.setProperty("padding-top", `${(parseInt(this.height) / parseInt(this.width)) * 100}%`);
            };
            image.src = this.avatar.name;
        },

        setFontSize() {
            if (this.$el.offsetWidth) this.$el.style.setProperty("font-size", `${this.$el.offsetWidth}px`);
            if (this.$refs.overlayIcons) {
                this.$refs.overlayIcons.style.setProperty("font-size", `calc(16px * ${parseInt(getComputedStyle(this.$refs.overlayIcons).fontSize) / 40})`);
            }
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Avatar.less"></style>
