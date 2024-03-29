<template>
    <div :class="`graphicEditor ${model.lastOccurredErrors.file ? 'errorField' : ''}`" @drop="onInternalDrop($event)" @dragover.prevent="onInternalDragOver($event)" @dragenter.prevent>
        <EditorHead
            ref="editorHead"
            :model="model"
            :name="`add${type.charAt(0).toUpperCase() + type.slice(1)}`"
            :onSaveButtonClick="onSaveButtonClick.bind(this)"
            @discarded="onDiscard"
            @saved="onSave"
        >
            <Button name="move" :showLabel="false" :active="currentTool && currentTool.name === 'move'" @click="setTool('move')">
                <hand-left-icon />
            </Button>
            <Button name="polyClickArea" :showLabel="false" :active="currentTool && currentTool.name === 'polyClickArea'" @click="setTool('polyClickArea')">
                <vector-polygon-icon />
            </Button>
            <Button name="select" :showLabel="false" :active="currentTool && currentTool.name === 'select'" @click="setTool('select')">
                <cursor-default-click-icon />
            </Button>
            <Button name="arrange" :showLabel="false" :active="currentTool && currentTool.name === 'arrange'" @click="setTool('arrange')">
                <arrange-bring-forward-icon />
            </Button>
        </EditorHead>
        <GraphicViewer ref="graphicViewer" :model="model" @wheel="onWheel($event)" @contextmenu.prevent="setTool(null)" />
        <UploadHint v-if="type !== 'scene'" ref="uploadHint" :uploadReadyFunc="onUploadReady.bind(this)" />
    </div>
</template>

<script>
import Button from "~client/components/Button";
import UploadHint from "~client/components/UploadHint";
import EditorHead from "~client/components/EditorHead";
import GraphicViewer from "~client/components/GraphicViewer";

import Move from "~client/lib/Move";
import Select from "~client/lib/Select";
import Arrange from "~client/lib/Arrange";
import PolyClickArea from "~client/lib/PolyClickArea";
import ApiClient from "~client/lib/ApiClient";

import SceneObject from "~client/models/SceneObject";
import File from "~client/models/File";
import ActionObject from "~client/models/ActionObject";

import { svgToPng } from "~common/utils";
import { parseEventModelData } from "~client/utils";

export default {
    components: {
        Button,
        UploadHint,
        EditorHead,
        GraphicViewer
    },
    props: {
        type: {
            type: String,
            required: true,
            default: "scene"
        }
    },
    data() {
        return {
            model: window.activeUser.editingModel,
            currentTool: null,
            watchedObjects: [],
            watchDebounceId: null,
            toolMap: {
                polyClickArea: PolyClickArea,
                move: Move,
                select: Select,
                arrange: Arrange
            }
        };
    },
    computed: {
        subObjects() {
            return this.model.getSubObjects();
        }
    },
    watch: {
        subObjects: {
            immediate: true,
            handler: function() {
                clearTimeout(this.watchDebounceId);
                this.watchDebounceId = setTimeout(() => {
                    const properties = ["clickAreas", "actionObjects"];
                    for (const property of properties) {
                        const subObjects = this.model[property];
                        for (let index = 0; index < subObjects.length; index++) {
                            const subObject = subObjects[index];
                            this.addSelectWatcher(`model.${property}.${index}.isSelected`, subObject);
                        }
                    }
                }, 100);
            }
        }
    },
    beforeDestroy() {
        this.model.getSubObjects().forEach((subObject) => {
            subObject.isSelected = false;
        });
    },
    methods: {
        addSelectWatcher(path, model) {
            if (this.watchedObjects.includes(model)) return;
            const activeLayer = this.$refs.graphicViewer.paper.project.activeLayer;
            let item = activeLayer.getItem({ recursive: true, match: (child) => child.model === model });
            this.watchedObjects.push(model);
            this.$watch(path, (newValue) => {
                if (!item) item = activeLayer.getItem({ recursive: true, match: (child) => child.model === model });
                if (!item) return;
                if (!(this.currentTool instanceof Select)) this.setTool(newValue ? "select" : null);
                item.selected = newValue;
            });
        },

        isAllowed(model) {
            return model && (model instanceof File.RawClass || model instanceof SceneObject.RawClass) && model !== this.model && !model.deleted && !model.getResources().includes(this.model);
        },

        /**
         * @param {DragEvent} event
         */
        onInternalDragOver(event) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;
            event.preventDefault();
            event.stopPropagation();

            const model = parseEventModelData(event);
            if (!model) return;
            if (!this.isAllowed(model)) {
                event.dataTransfer.dropEffect = "none";
            } else event.dataTransfer.dropEffect = "link";
        },

        /**
         * @param {DragEvent} event
         */
        onInternalDrop(event) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            const model = parseEventModelData(event);
            if (!this.isAllowed(model)) return;
            this.addObject(model);
        },

        /**
         * @param {File["Model"]} files
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
            const paper = this.$refs.graphicViewer.paper;
            const oldCenter = paper.view.center;
            const mousePosition = paper.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));
            const delta = oldCenter.subtract(mousePosition);
            const zoom = 0.1;

            let sign = 1;
            if (event.deltaY > 0) sign = -1;

            const scaleFactor = 1 + zoom * sign;
            paper.view.scale(scaleFactor);
            paper.view.translate(delta.multiply(zoom * sign));
        },

        async onSaveButtonClick() {
            const result = await this.model.save();
            if (result instanceof Error) return;
            this.createAvatar();
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        },

        async onSave() {
            const paper = this.$refs.graphicViewer.paper;
            await this.createAvatar();
            paper.project.clear();
        },

        onDiscard() {
            const paper = this.$refs.graphicViewer.paper;
            paper.project.clear();
        },

        setTool(toolName) {
            const paper = this.$refs.graphicViewer.paper;

            if (this.currentTool || typeof toolName === "string") {
                let toolToSet = null;
                if (toolName in this.toolMap && toolName !== this.currentTool?.name) toolToSet = new this.toolMap[toolName](paper, this.model, this.setTool.bind(this));
                if (this.currentTool) this.currentTool.remove();
                this.currentTool = toolToSet;
            } else if (this.selectedItem) {
                this.selectedItem.selected = false;
                this.selectedItem = null;
            }
        },

        addObject(model) {
            this.addBackground(model);
            this.addActionObject(model);
        },

        addBackground(model) {
            if (!(model instanceof File.RawClass) || !model.mime.startsWith("image")) return;
            const view = this.$refs.graphicViewer.paper.view;
            this.model.file = model;
            if (!this.model.position) this.model.position = [view.center.x, view.center.y];
        },

        addActionObject(model) {
            // Has to be an Scene Object which can be passed into an action object
            // Should not be the same model as the current watched model to avoid recursion loop
            // has to be checked with the id because watched model can be an recursive proxy
            if (!(model instanceof SceneObject.RawClass) || model._id === this.model._id) return;

            const paper = this.$refs.graphicViewer.paper;
            let actionObjectsMap = this.$refs.graphicViewer.actionObjectsMap;

            const actionObjectAmountBefore = actionObjectsMap.length;
            const actionObject = ApiClient.store.addModel(new ActionObject.Model({
                position: [paper.view.center.x, paper.view.center.y],
                sceneObject: model,
                layer: actionObjectsMap.length
            }));
            this.model.actionObjects.push(actionObject);
            const actionObjectAmountAfter = actionObjectsMap.length;

            // To be able to find the last action object in the map, we need to
            // know how many objects were added by the current actionObject and
            // subtract that amount from the length.
            const actionObjectAmountDifference = actionObjectAmountAfter - actionObjectAmountBefore;

            // resolve the last known promise
            actionObjectsMap = this.$refs.graphicViewer.actionObjectsMap;
            const lastActionObject = actionObjectsMap[actionObjectsMap.length - actionObjectAmountDifference - 1];
            if ((actionObjectsMap.length - 2) >= 0 && lastActionObject) lastActionObject.next();

            setTimeout(() => {
                const item = this.$refs.graphicViewer.paper.project.activeLayer.getItem({
                    recursive: true,
                    match: (child) => child.model === actionObject
                });
                if (item) {
                    this.setTool("select");
                    item.selected = true;
                    actionObject.isSelected = true;
                }
            });
        },

        async createAvatar() {
            if (!this.model._id) return;
            this.model.loadingStatus = -1;

            try {
                const blob = await svgToPng(this.$refs.graphicViewer.paper.project.exportSVG({
                    asString: true,
                    bounds: "content"
                }));
                if (!blob) return;
                const formData = new FormData();
                formData.append('file', blob, this.model._id);
                ApiClient.upload("PUT", `/${this.model.dataCollectionName}/${this.model._id}`, {
                    formData: formData,
                    onProgress: (progress) => this.model.loadingStatus = progress,
                    onSuccess: () => {
                        this.model.loadingStatus = 0;
                        this.model.isCreatingAvatar = false;
                    },
                    onError: () => {
                        this.model.loadingStatus = 0;
                        this.model.isCreatingAvatar = false;
                    }
                });
            } catch (error) {
                this.$toasted.error("unknownError", { className: "errorToaster" });
            }
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/GraphicEditor.less"></style>
