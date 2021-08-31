<template>
    <div class="uploadHint" ref="uploadHint">
        <div class="wrapper">
            <component v-if="icon" :is="icon" class="icon"></component>
            <div class="text">{{ $t(this.text) }}</div>
        </div>
        <img class="getSizeImage" ref="getSizeImage">
        <input type="file" name="file" style="display: none" ref="fileInput" multiple @change="onDrop($event)"/>
    </div>
</template>

<script>
import ApiClient from "~client/lib/ApiClient";
import FileExport from "~client/models/File";

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
                const convertedFile = await this.convertToFixedSVG(file);
                const fileModel = new FileExport.Model({
                    fileName: convertedFile.name,
                    size: convertedFile.size,
                    mime: convertedFile.type,
                    name: convertedFile.name
                });
                fileModel.formData.append("file", convertedFile);
                ApiClient.store.addModel(fileModel);
                promises.push(fileModel.save());
            }
            const result = (await Promise.all(promises)).filter((model) => Boolean(model));
            if (this.uploadReadyFunc) this.uploadReadyFunc(result);
        },

        /**
         * Because FF has a bug: https://bugzilla.mozilla.org/show_bug.cgi?id=700533
         * we need to fix all SVG in size.
         *
         * @param {File} file
         * @returns {Promise<File>}
         */
        async convertToFixedSVG(file) {
            // We only want to fix SVG
            if (!file.type.includes("svg")) return Promise.resolve(file);

            const text = await file.text();
            const parser = new DOMParser();

            try {
                // Maybe the file was a fake and it cant be parsed correctly
                const XMLDOM = parser.parseFromString(text, "text/xml");
                if (!XMLDOM) return Promise.resolve(file);

                // Maybe the file was a fake and there is no SVG element
                const SVG = XMLDOM.getElementsByTagName("svg")[0];
                if (!SVG) return Promise.resolve(file);

                // We only want to fix SVG when it hasn't any of the dimensions or any of them is in percent
                const hasNonePercentWidth = SVG.hasAttribute("width") && !SVG.getAttribute("width").includes("%");
                const hasNonePercentHeight = SVG.hasAttribute("height") && !SVG.getAttribute("height").includes("%");
                if (hasNonePercentWidth && hasNonePercentHeight) return Promise.resolve(file);

                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = this.$refs.getSizeImage;
                        img.onload = () => {
                            if (!SVG.hasAttribute("width") || SVG.getAttribute("width").includes("%")) {
                                SVG.setAttribute("width", img.naturalWidth || img.width || 100);
                            }

                            if (!SVG.hasAttribute("height") || SVG.getAttribute("height").includes("%")) {
                                SVG.setAttribute("height", img.naturalHeight || img.height || 100);
                            }

                            const xml = new XMLSerializer().serializeToString(XMLDOM.documentElement);
                            const blob = new Blob([xml], { type: file.type });
                            resolve(new File([blob], file.name, { type: file.type, lastModified: file.lastModified }));
                        };
                        img.setAttribute("src", event.target.result);
                    };
                    reader.readAsDataURL(file);
                });
            } catch (error) {
                return Promise.resolve(file);
            }
        },

        removeEventListeners() {
            this.$parent.$el.removeEventListener("dragover", this.dragOverListenerFunc);
            this.$parent.$el.removeEventListener("drop", this.dropListenerFunc);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/UploadHint.less"></style>
