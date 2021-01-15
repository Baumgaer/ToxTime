<template>
    <div class="uploadHint" ref="uploadHint">
        <div class="wrapper">
            <component v-if="icon" :is="icon" class="icon"></component>
            <div class="text">{{ $t(this.text) }}</div>
        </div>
    </div>
</template>

<script>
import ApiClient from "~client/lib/ApiClient";
export default {
    props: {
        icon: {
            type: String,
            default: "file-upload-icon"
        },
        text: {
            type: String,
            default: "upload"
        },
        ownUploadHandling: Function
    },
    data() {
        return {
            dragOverListenerFunc: this.onDragOver.bind(this),
            dropListenerFunc: this.onDrop.bind(this)
        };
    },
    mounted() {
        this.$parent.$el.addEventListener("dragover", this.dragOverListenerFunc);
        this.$parent.$el.addEventListener("drop", this.dropListenerFunc);
        this.$parent.$once("hook:beforeDestroy", this.removeEventListeners.bind(this));
    },
    methods: {
        /**
         *
         * @param {DragEvent} event
         */
        onDragOver(event) {
            if (ApiClient.store.collection("localStorage").isInternalDnD) return;
            event.preventDefault();
            event.stopPropagation();
            this.$refs.uploadHint.style.display = "block";

            clearTimeout(this.dragOverTimeout);
            this.dragOverTimeout = setTimeout(this.onDragLeave.bind(this, event), 100);
        },

        /**
         *
         * @param {DragEvent} event
         */
        onDragLeave(event) {
            if (ApiClient.store.collection("localStorage").isInternalDnD) return;
            event.preventDefault();
            event.stopPropagation();
            this.$refs.uploadHint.style.display = "none";
        },

        /**
         * @param {DragEvent} event
         */
        onDrop(event) {
            if (ApiClient.store.collection("localStorage").isInternalDnD) return;
            event.preventDefault();
            event.stopPropagation();
            if (this.ownUploadHandling) return this.ownUploadHandling(event);
            console.log(event.dataTransfer.types);
            this.$refs.uploadHint.style.display = "none";
        },

        removeEventListeners() {
            this.$parent.$el.removeEventListener("dragover", this.dragOverListenerFunc);
            this.$parent.$el.removeEventListener("drop", this.dropListenerFunc);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/UploadHint.less"></style>
