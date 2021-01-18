<template>
    <div class="graphicEditor">
        <header>
            <h2>{{ $t('addUsers') }}</h2>
            <div class="buttons">
                <Button ref="send" class="sendButton" name="addUsers" v-on:click="onSendButtonClick()" >
                    <content-save-icon />
                </Button>
            </div>
        </header>
        <img ref="background"
             style="display: none;"
             v-if="watchedModel.file"
             :src="`/files/${watchedModel.file._dummyId || watchedModel.file._id}`"
             :id="`${watchedModel.file.collection}${watchedModel.file._dummyId || watchedModel.file._id}`"
             @load="onBackgroundLoaded($event)"
        >
        <canvas ref="canvas" resize @drop="onInternalDrop($event)"></canvas>
        <UploadHint v-if="type !== 'scene'" ref="uploadHint" :uploadReadyFunc="onUploadReady.bind(this)" />
    </div>
</template>

<script>
import Button from "~client/components/Button";
import UploadHint from "~client/components/UploadHint";
import ApiClient from "~client/lib/ApiClient";
import paper from "paper";
import SceneObject from "~client/models/SceneObject";
import FileModelExport from "~client/models/File";

export default {
    components: {
        Button,
        UploadHint
    },
    props: {
        type: {
            type: String,
            required: true,
            default: "scene"
        },
        model: Object
    },
    data() {
        return {
            paper: new paper.PaperScope(),
            watchedModel: {}
        };
    },
    mounted() {
        if (this.model) {
            this.watchedModel = this.model;
        } else this.watchedModel = ApiClient.store.addModel(new SceneObject.Model());
        this.paper.install(this);
        this.paper.setup(this.$refs.canvas);
    },
    beforeDestroy() {
        if (this.watchedModel.hasChanges()) {
            this.$toasted.success(window.vm.$t("saved", { name: this.watchedModel.getName() }), { className: "successToaster" });
            this.watchedModel.save();
        } else if (!this.model) {
            this.watchedModel.destroy();
            this.$toasted.info(window.vm.$t("discarded", { name: this.watchedModel.getName() }), { className: "infoToaster" });
        }
    },
    methods: {
        /**
         * @param {DragEvent} event
         */
        onInternalDrop(event) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;
            ApiClient.store.collection("localStorage").isInternalDnD = false;

            event.preventDefault();
            event.stopPropagation();

            if (event.model) this.addObject(event.model);
        },

        /**
         * @param {FileModelExport["Model"]} files
         */
        onUploadReady(files) {
            for (const file of files) {
                if (!file.mime.startsWith("image")) continue;
                this.addObject(file);
                break;
            }
        },

        addObject(model) {
            if (model instanceof FileModelExport.RawClass) this.addBackground(model);
            console.log(model);
        },

        addBackground(model) {
            if (!(model instanceof FileModelExport.RawClass) || !model.mime.startsWith("image")) return;
            this.watchedModel.file = model;
        },

        onBackgroundLoaded() {
            this.paper.view.viewSize = new this.paper.Size(this.$refs.background.width, this.$refs.background.height);
            const raster = new this.paper.Raster(this.$refs.background);
            raster.position = this.paper.view.center;
            this.paper.view.draw();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/GraphicEditor.less"></style>
