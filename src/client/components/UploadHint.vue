<template>
    <div class="uploadHint" ref="uploadHint">
        <div class="wrapper">
            <component v-if="icon" :is="icon" class="icon"></component>
            <div class="text">{{ $t(this.text) }}</div>
        </div>
        <input type="file" name="file" style="display: none" ref="fileInput" multiple @change="onDrop($event)"/>
    </div>
</template>

<script>
import ApiClient from "~client/lib/ApiClient";
import File from "~client/models/File";

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
        ownUploadHandling: Function,
        uploadReadyFunc: Function
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
         * @returns {Promise<File>[]}
         */
        async onDrop(event) {
            if (ApiClient.store.collection("localStorage").isInternalDnD) return;
            event.preventDefault();
            event.stopPropagation();
            if (this.ownUploadHandling) return this.ownUploadHandling(event);
            this.$refs.uploadHint.style.display = "none";
            const promises = [];
            for (const file of Array.from((event.dataTransfer || event.target).files)) {
                const fileModel = new File.Model({
                    fileName: file.name,
                    size: file.size,
                    mime: file.type,
                    name: file.name
                });
                fileModel.formData.append("file", file);
                ApiClient.store.addModel(fileModel);
                promises.push(fileModel.save());
            }
            const result = (await Promise.all(promises)).filter((model) => Boolean(model));
            if (this.uploadReadyFunc) this.uploadReadyFunc(result);
        },

        removeEventListeners() {
            this.$parent.$el.removeEventListener("dragover", this.dragOverListenerFunc);
            this.$parent.$el.removeEventListener("drop", this.dropListenerFunc);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/UploadHint.less"></style>
