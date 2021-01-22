<template>
    <header>
        <h2>{{ $t(name) }}</h2>
        <div class="buttons">
            <Button ref="send" class="close" name="close" :showLabel="false" v-on:click="onCloseButtonClick()" >
                <close-icon />
            </Button>
            <Button ref="send" class="save" :name="name" :showLabel="false" v-on:click="onSaveButtonClick()" >
                <content-save-icon />
            </Button>
            <slot></slot>
        </div>
    </header>
</template>

<script>
import Button from "~client/components/Button";
export default {
    components: {
        Button
    },
    props:{
        name: {
            type: String,
            required: true
        },
        onSaveButtonClick:{
            type: Function,
            required: true
        }
    },
    methods: {
        onCloseButtonClick() {
            window.activeUser.activeEditor = null;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/EditorHead.less"></style>
