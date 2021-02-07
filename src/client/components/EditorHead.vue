<template>
    <header>
        <h2>{{ $t(name) }}</h2>
        <div class="buttons">
            <Button class="close" name="close" :showLabel="false" v-on:click="onCloseButtonClick()" >
                <close-icon />
            </Button>
            <Button class="save" name="save" :showLabel="false" v-on:click="onSaveButtonClick()" >
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
    data() {
        return {
            closeButtonClicked: false
        };
    },
    methods: {
        onCloseButtonClick() {
            this.closeButtonClicked = true;
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/EditorHead.less"></style>
