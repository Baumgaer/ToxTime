<template>
    <section class="item">
        <div class="avatar" v-if="this.hasAvatar">
            <div v-if="this.hasImageAvatar" :style="`background-image: url(${this.model.getAvatar().name})`"></div>
            <component v-else :is="this.model.getAvatar().name"></component>
        </div>
        <div class="info">
            <div class="name"><strong>{{ this.model.getName() }}</strong></div>
            <div class="actions">
                <div class="action" v-for="action of this.model.getActions()" :key="action.name" :title="$t(action.name)">{{ action.symbol }} {{ $t(action.name) }}</div>
            </div>
        </div>
    </section>
</template>

<script>

export default {
    props: {
        model: {
            type: Object,
            required: true
        }
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
