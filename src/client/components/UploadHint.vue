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

            let text = await file.text();

            /**
             * @param {string} content
             * @param {string} attributeName
             */
            const setAttribute = (content, attributeName) => {
                const svgRegex = new RegExp("<svg .*?>");
                const attributeRegex = new RegExp(`${attributeName}="([\\s\\S]+?)"`);
                const viewBoxRegex = new RegExp(`viewBox="([\\s\\S]+?)"`);

                const svgTag = content.match(svgRegex);
                if (!svgTag) return content;

                const attribute = svgTag[0].match(attributeRegex);
                const viewBox = svgTag[0].match(viewBoxRegex);

                const before = content.substring(0, svgTag.index);
                const after = content.substring(svgTag.index + svgTag[0].length);

                let result = before;
                if (!attribute || attribute[1].includes("%")) {
                    let dimensions = {width: "1920", height: "1080"};
                    if (viewBox) dimensions = {width: viewBox[1].split(" ")[2], height: viewBox[1].split(" ")[3]};
                    if (attribute) {
                        result += svgTag[0].substring(0, attribute.index);
                    } else result += "<svg ";
                    result += `${attributeName}="${dimensions[attributeName]}"`;
                    if (attribute) {
                        result += svgTag[0].substring(attribute.index + attribute[0].length);
                    } else result += svgTag[0].substring(4);
                    result += after;
                }

                return result;
            };

            text = setAttribute(text, "width");
            text = setAttribute(text, "height");

            return new Promise((resolve) => {
                const blob = new Blob([text], { type: file.type });
                resolve(new File([blob], file.name, { type: file.type, lastModified: file.lastModified }));
            });
        },

        removeEventListeners() {
            this.$parent.$el.removeEventListener("dragover", this.dragOverListenerFunc);
            this.$parent.$el.removeEventListener("drop", this.dropListenerFunc);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/UploadHint.less"></style>
