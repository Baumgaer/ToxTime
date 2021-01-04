<template>
    <label class="switch">
        <input ref="input" type="checkbox" :name="name" :value="value" v-on:focus="$emit('focus')" v-on:change="$emit('change')">
        <span class="slider"></span>
    </label>
</template>

<script>
export default {
    props: {
        name: String,
        value: String
    },
    computed: {
        checked() {
            return this.$refs.input.checked;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/ToggleSwitch.less"></style>
