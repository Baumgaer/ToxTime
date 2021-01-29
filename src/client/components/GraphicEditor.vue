<template>
    <div class="graphicEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" :name="`add${type.charAt(0).toUpperCase() + type.slice(1)}`" :onSaveButtonClick="onSaveButtonClick.bind(this)" >
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
                 @load="onBackgroundLoaded($event)"
            />
            <img v-for="subObject of subObjects"
                 style="display: none;"
                 :ref="`subObjectBackground${subObject.model._id}`"
                 :key="subObject.model._id"
                 :src="`/files/${subObject.model.file._id}`"
                 @load="onSubObjectBackgroundLoaded(subObject)"
            />
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
            subObjects: [],
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
        if (!this.$refs.editorHead.closeButtonClicked && this.watchedModel.hasChanges()) {
            this.$toasted.success(window.vm.$t("saved", { name: this.watchedModel.getName() }), { className: "successToaster" });
            this.watchedModel.save();
        } else if (!this.model) {
            this.watchedModel.destroy();
            this.$toasted.info(window.vm.$t("discarded", { name: this.watchedModel.getName() }), { className: "infoToaster" });
        } else if (this.$refs.editorHead.closeButtonClicked) {
            this.watchedModel.discard();
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
            const raster = new this.paper.Raster(this.$refs.background);
            raster.position = this.paper.view.center;
            raster.sendToBack();
            this.watchedModel.filePosition = [raster.position.x, raster.position.y];
            this.paper.view.background = raster;
            this.paper.view.draw();
        },

        onSubObjectBackgroundLoaded(subObject) {
            const index = this.subObjects.indexOf(subObject);
            /** @type {InstanceType<import("paper")["Group"]>} */
            const group = this.subObjects[index];
            if (!group) return;
            const raster = new this.paper.Raster(this.$refs[`subObjectBackground${subObject.model._id}`][0]);
            group.children = [raster, ...group.children];
            this.paper.view.draw();
        },

        onSaveButtonClick() {
            this.watchedModel.save();
        },

        setTool(toolName) {
            if (this.currentTool || typeof toolName === "string") {
                let toolToSet = null;
                if (toolName in this.toolMap && toolName !== this.currentTool?.name) toolToSet = new this.toolMap[toolName](this.paper, this.watchedModel);
                if (this.currentTool) this.currentTool.remove();
                this.currentTool = toolToSet;
            } else if (this.selectedItem) {
                this.selectedItem.selected = false;
                this.selectedItem = null;
            }
        },

        addObject(model) {
            if (model instanceof FileModelExport.RawClass) this.addBackground(model);
            if (model instanceof SceneObject.RawClass) this.addSubObject(model);
        },

        addBackground(model) {
            if (!(model instanceof FileModelExport.RawClass) || !model.mime.startsWith("image")) return;
            this.watchedModel.file = model;
        },

        addSubObject(model) {
            const children = [];
            for (const clickArea of model.clickAreas) {
                const child = PolyClickArea.build(this.paper, clickArea.shape.map((point) => [point[0] - (clickArea.position[0] - model.filePosition[0]), point[1] - (clickArea.position[1] - model.filePosition[1])]));
                child.locked = true;
                children.push(child);
            }
            const group = new this.paper.Group({
                children: children,
                position: this.paper.view.center,
                name: model.getName()
                // scaling,
                // rotation
            });
            group.model = model;
            this.subObjects.push(group);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/GraphicEditor.less"></style>
