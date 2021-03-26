<template>
    <div :class="`${active ? 'button active' : 'button'} ${showLoadingSpinner ? 'buttonLoading' : ''}`" :title="transName" v-on:click="$emit('click', $event)">
        <div class="icon"><slot></slot></div>
        <div v-show="showLabel" class="label">{{ transName }}</div>
    </div>
</template>

<script>
export default {
    props: {
        name: String,
        nameIsTranslated: Boolean,
        active: Boolean,
        showLoadingSpinner: Boolean,
        showLabel: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        transName() {
            return this.nameIsTranslated ? this.name : this.$t(this.name);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Button.less"></style>
