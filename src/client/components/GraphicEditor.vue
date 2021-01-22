<template>
    <div class="graphicEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead :name="`add${type.charAt(0).toUpperCase() + type.slice(1)}`" :onSaveButtonClick="onSaveButtonClick.bind(this)" >
            <Button name="move" :showLabel="false" :active="currentTool === 'move'" @click="setTool('move')">
                <hand-left-icon />
            </Button>
        </EditorHead>
        <div ref="canvasWrapper" class="canvasWrapper" @contextmenu.prevent="setTool(null)">
            <img ref="background"
                 style="display: none;"
                 v-if="watchedModel.file"
                 :src="`/files/${watchedModel.file._dummyId || watchedModel.file._id}`"
                 :id="`${watchedModel.file.collection}${watchedModel.file._dummyId || watchedModel.file._id}`"
                 @load="onBackgroundLoaded($event)"
            >
            <canvas ref="canvas" resize @wheel="onWheel($event)"></canvas>
        </div>
        <UploadHint v-if="type !== 'scene'" ref="uploadHint" :uploadReadyFunc="onUploadReady.bind(this)" />
    </div>
</template>

<script>
import Button from "~client/components/Button";
import UploadHint from "~client/components/UploadHint";
import EditorHead from "~client/components/EditorHead";
import ApiClient from "~client/lib/ApiClient";
import paper from "paper";
import SceneObject from "~client/models/SceneObject";
import FileModelExport from "~client/models/File";

export default {
    components: {
        Button,
        UploadHint,
        EditorHead
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
            watchedModel: {},
            currentTool: null,
            selectedItem: null,
            background: null,
            hitOptions: {
                segments: true,
                stroke: true,
                fill: true,
                tolerance: 5
            }
        };
    },
    mounted() {
        if (this.model) {
            this.watchedModel = this.model;
        } else this.watchedModel = ApiClient.store.addModel(new SceneObject.Model());
        this.paper.install(this);
        this.paper.setup(this.$refs.canvas);
        this.paper.settings.handleSize = 12;
        this.paper.view.onMouseDrag = this.onMouseDrag.bind(this);
        this.paper.view.onMouseDown = this.onMouseDown.bind(this);
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

            event.preventDefault();
            event.stopPropagation();

            let eventData = event.dataTransfer.getData("model");
            if (eventData) eventData = JSON.parse(eventData);
            if (eventData) this.addObject(ApiClient.store.getModelById(eventData.collection, eventData._id));
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

        /**
         * @param {import("paper")["MouseEvent"]} event
         */
        onMouseDrag(event) {
            if (this.currentTool === "move") this.paper.view.translate(event.delta);
        },

        /**
         * @param {WheelEvent} event
         */
        onWheel(event) {
            const zoom = 0.1;
            let sign = 1;
            if (event.wheelDelta < 0) sign = -1;
            this.paper.view.scale(1 + zoom * sign);
        },

        onBackgroundLoaded() {
            if (this.background) this.background.remove();
            const raster = new this.paper.Raster(this.$refs.background, new this.paper.Point(0,0));
            raster.position = this.paper.view.center;
            this.background = raster;
            this.paper.view.draw();
        },

        onSaveButtonClick() {
            this.watchedModel.save();
        },

        onMouseDown(event) {
            const hitResult = this.paper.project.hitTest(event.point, this.hitOptions);
            if (!hitResult || this.currentTool || hitResult.item === this.background) return;
            if (hitResult.type === "segment") {
                // Add segment
            } else if (hitResult.type === "stroke") {
                // move stroke
            } else {
                // select item
                hitResult.item.selected = true;
                this.selectedItem = hitResult.item;
            }
        },

        setTool(toolName) {
            if (this.currentTool || typeof toolName === "string") {
                let toolnameToSet = toolName;
                if (this.currentTool === toolName) toolnameToSet = null;
                this.currentTool = toolnameToSet;
            } else if (this.selectedItem) {
                this.selectedItem.selected = false;
                this.selectedItem = null;
            }
        },

        addObject(model) {
            if (model instanceof FileModelExport.RawClass) this.addBackground(model);
            console.log(model);
        },

        addBackground(model) {
            if (!(model instanceof FileModelExport.RawClass) || !model.mime.startsWith("image")) return;
            this.watchedModel.file = model;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/GraphicEditor.less"></style>
