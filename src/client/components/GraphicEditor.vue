<template>
    <div class="graphicEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead :name="`add${type.charAt(0).toUpperCase() + type.slice(1)}`" :onSaveButtonClick="onSaveButtonClick.bind(this)" >
            <Button name="move" :showLabel="false" :active="currentTool && currentTool.name === 'move'" @click="setTool('move')">
                <hand-left-icon />
            </Button>
            <Button name="polyClickArea" :showLabel="false" :active="currentTool && currentTool.name === 'polyClickArea'" @click="setTool('polyClickArea')">
                <vector-polygon-icon />
            </Button>
            <Button name="select" :showLabel="false" :active="currentTool && currentTool.name === 'select'" @click="setTool('select')">
                <cursor-default-click-icon />
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
import SceneObject from "~client/models/SceneObject";
import FileModelExport from "~client/models/File";
import PolyClickArea from "~client/lib/PolyClickArea";
import Move from "~client/lib/Move";
import Select from "~client/lib/Select";
import paper from "paper";

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
            toolMap: {
                polyClickArea: PolyClickArea,
                move: Move,
                select: Select
            }
        };
    },
    mounted() {
        if (this.model) {
            this.watchedModel = this.model;
        } else this.watchedModel = ApiClient.store.addModel(new SceneObject.Model());
        this.paper.install(this);
        this.paper.setup(this.$refs.canvas);
        this.paper.settings.handleSize = 10;
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
            raster.sendToBack();
            this.paper.view.background = raster;
            this.paper.view.draw();
        },

        onSaveButtonClick() {
            this.watchedModel.save();
        },

        setTool(toolName) {
            if (this.currentTool || typeof toolName === "string") {
                let toolToSet = null;
                if (toolName in this.toolMap && toolName !== this.currentTool?.name) toolToSet = new this.toolMap[toolName](this.paper);
                if (this.currentTool) this.currentTool.remove();
                this.currentTool = toolToSet;
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
