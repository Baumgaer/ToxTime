<template>
    <div class="avatar" v-if="hasAvatar" :title="model.getAvatar().title">
        <div v-if="hasImageAvatar" :style="`background-image: url(${model.getAvatar().name})`"></div>
        <component v-else :is="model.getAvatar().name" :title="model.getAvatar().title"></component>
        <div class="overlayIcons" v-if="overlayIcons">
            <component v-for="overlayIcon of overlayIcons.split(' ')" :is="overlayIcon" :key="overlayIcon" class="overlayIcon"></component>
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
        overlayIcons: String
    },
    computed: {
        hasAvatar() {
            return Boolean(this.model.getAvatar());
        },

        hasImageAvatar() {
            const avatarData = this.model.getAvatar();
            if (!avatarData) return false;
            if (avatarData.type === "image") return true;
            return false;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Avatar.less"></style>
