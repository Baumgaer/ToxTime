<template>
    <div :class="`${active ? 'button active' : 'button'} ${showLoadingSpinner ? 'buttonLoading' : ''}`" :title="$t(this.name)" v-on:click="$emit('click')">
        <div class="icon"><slot></slot></div>
        <div v-show="showLabel" class="label">{{ $t(this.name) }}</div>
    </div>
</template>

<script>
export default {
    props: {
        name: String,
        active: Boolean,
        showLoadingSpinner: Boolean,
        showLabel: {
            type: Boolean,
            default: true
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Button.less"></style>
