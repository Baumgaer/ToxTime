<template>
    <label class="switch">
        <input v-if="checked" ref="input" type="checkbox" checked :name="name" :value="value" v-on:focus="$emit('focus')" v-on:change="$emit('change')">
        <input v-else ref="input" type="checkbox" :name="name" :value="value" v-on:focus="$emit('focus')" v-on:change="$emit('change')">
        <span class="slider"></span>
    </label>
</template>

<script>
export default {
    props: {
        name: String,
        value: String,
        checked: Boolean
    }
};
</script>

<style lang="less" scoped src="~client/less/ToggleSwitch.less"></style>
