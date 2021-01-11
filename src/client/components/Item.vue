<template>
    <section class="item">
        <div class="avatar" v-if="hasAvatar">
            <div v-if="hasImageAvatar" :style="`background-image: url(${model.getAvatar().name})`"></div>
            <component v-else :is="model.getAvatar().name"></component>
        </div>
        <div class="info">
            <div class="name"><strong>{{ model.getName() }}</strong></div>
            <div class="actions">
                <div v-for="action of model.actions" :key="action.name" class="action">
                    <Button  v-if="action.symbol.type === 'component' && [undefined, true].includes(action.if)" class="action" :name="action.name" :showLabel="false" @click="action.func()">
                        <component :is="action.symbol.name"></component>
                    </Button>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import Button from "~client/components/Button";

export default {
    components: {
        Button
    },
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
