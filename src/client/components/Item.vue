<template>
    <section class="item">
        <div class="avatar" v-if="hasAvatar">
            <div v-if="hasImageAvatar" :style="`background-image: url(${model.getAvatar().name})`"></div>
            <component v-else :is="model.getAvatar().name"></component>
            <div class="overlayIcons" v-if="overlayIcons">
                <component v-for="overlayIcon of overlayIcons.split(' ')" :is="overlayIcon" :key="overlayIcon" class="overlayIcon"></component>
            </div>
        </div>
        <div class="info">
            <div class="name"><strong>{{ model.getName() ? model.getName() : $t("unnamed") }}</strong></div>
            <div class="actions">
                <div v-for="action of model.actions" :key="`${model._id || model._dummyId}${action.name}`" class="action">
                    <Button  v-if="action.symbol.type === 'component' && action.condition" class="action" :name="action.name" :showLabel="false" @click="action.func()">
                        <component :is="action.symbol.name"></component>
                    </Button>
                </div>
            </div>
        </div>
        <ProgressBar :model="model" class="progressBar" />
    </section>
</template>

<script>
import Button from "~client/components/Button";
import ProgressBar from "~client/components/ProgressBar";

export default {
    components: {
        Button,
        ProgressBar
    },
    props: {
        model: {
            type: Object,
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

<style lang="less" scoped src="~client/less/Item.less"></style>
