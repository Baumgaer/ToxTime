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
            <img v-for="(actionObjectMap, index) of actionObjectsMap"
                 style="display: none;"
                 :ref="`actionObjectBackground${actionObjectMap.actionObject._id}${index}`"
                 :key="`${actionObjectMap.actionObject._id}${index}`"
                 :src="`/files/${actionObjectMap.actionObject.sceneObject.file._id}`"
                 @load="onActionObjectBackgroundLoaded(actionObjectMap, index)"
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
import File from "~client/models/File";
import ActionObject from "~client/models/ActionObject";

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
    computed: {
        actionObjectsMap() {
            if (!this.watchedModel) return [];
            const map = [];

            const getRecursive = (model, ownerGroupModel) => {
                if (!model || !model.actionObjects) return;
                for (const actionObject of model.actionObjects) {
                    let promise = new Promise((resolve) => {
                        const prev = map[map.length - 1];
                        if (prev) prev.resolve = resolve;
                    });
                    if (!map[map.length - 1]) promise = null;
                    map.push({ actionObject, ownerGroupModel, promise });
                    getRecursive(actionObject.sceneObject, actionObject);
                }
            };

            getRecursive(this.watchedModel);
            return map;
        }
    },
    mounted() {
        if (this.model) {
            this.watchedModel = this.model;
        } else this.watchedModel = ApiClient.store.addModel(new SceneObject.Model());

        this.paper.install(this);
        this.paper.setup(this.$refs.canvas);
        this.paper.settings.handleSize = 10;
    },
    async beforeDestroy() {
        if (!this.$refs.editorHead.closeButtonClicked) {
            // Cases editor was closed unexpected
            if (this.watchedModel.hasChanges() || !this.watchedModel._id) {
                const result = await this.watchedModel.save();
                if (result instanceof Error) {
                    this.paper.project.clear();
                    return;
                }
                this.$toasted.success(window.vm.$t("saved", { name: this.watchedModel.getName() }), { className: "successToaster" });
                this.createAvatar();
                this.paper.project.clear();
            }
        } else {
            if (this.model || this.watchedModel._id) {
                if (this.watchedModel.hasChanges()) {
                    this.$toasted.info(window.vm.$t("discarded", { name: this.watchedModel.getName() }), { className: "infoToaster" });
                    this.watchedModel.discard();
                }
            } else {
                this.watchedModel.destroy();
                this.$toasted.info(window.vm.$t("discarded", { name: this.watchedModel.getName() }), { className: "infoToaster" });
            }
            this.paper.project.clear();
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
            const zoom = 0.1;
            let sign = 1;
            if (event.wheelDelta < 0) sign = -1;
            const scaleFactor = 1 + zoom * sign;
            this.paper.view.scale(scaleFactor);
            this.currentScaleFactor = this.currentScaleFactor * scaleFactor;
        },

        onBackgroundLoaded() {
            if (this.background) this.background.remove();
            const raster = new this.paper.Raster(this.$refs.background);
            raster.position = this.paper.view.center;
            raster.scaling = this.paper.project.activeLayer.getScaling();
            raster.sendToBack();
            this.watchedModel.position = [raster.position.x, raster.position.y];
            this.paper.view.background = raster;
            this.paper.view.draw();
        },

        async onActionObjectBackgroundLoaded(actionObjectMap, index) {

            // If not the first one (which does not have an awaiting promise),
            // wait until the previous actionObject has fulfilled
            if (actionObjectMap.promise) await actionObjectMap.promise;

            const actionObject = actionObjectMap.actionObject;
            const backGroundPos = new this.paper.Point(actionObject.sceneObject.position);
            const raster = new this.paper.Raster(this.$refs[`actionObjectBackground${actionObject._id}${index}`][0]);

            const group = new this.paper.Group({ children: [raster], position: new this.paper.Point(actionObject.position), rotation: actionObject.rotation });
            group.scaling = this.paper.project.activeLayer.getScaling();
            group.model = actionObject;

            // Add clickAreas
            for (const clickArea of actionObject.sceneObject.clickAreas) {
                const path = PolyClickArea.build(this.paper, clickArea.shape);
                const oldPos = new this.paper.Point(clickArea.position);
                path.position = raster.position.add(oldPos.subtract(backGroundPos));
                path.locked = true;
                group.addChild(path);
            }

            // Process sub action objects
            if (actionObjectMap.ownerGroupModel) {
                const ownerGroup = this.paper.project.getItem({
                    recursive: true,
                    match: (child) => child.model === actionObjectMap.ownerGroupModel
                });

                // Determine scaling factor recursive over all parents of the current group
                let scaleFactor = actionObject.scale;
                let scaleOwnerGroup = ownerGroup;
                while(scaleOwnerGroup && scaleOwnerGroup instanceof this.paper.Group && !(scaleOwnerGroup instanceof this.paper.Layer)) {
                    scaleFactor *= scaleOwnerGroup.model.scale;
                    scaleOwnerGroup = scaleOwnerGroup.parent;
                }

                // Apply scaling of owner to be in same zoom and then scale current recursive
                group.scaling = ownerGroup.getScaling();
                group.scale(scaleFactor);

                const oldPos = new this.paper.Point(actionObject.position);
                group.position = ownerGroup.children[0].position.add(oldPos.subtract(backGroundPos));
                group.locked = true;
                ownerGroup.addChild(group);
            }

            // Refresh view to be sure that the group is visible
            this.paper.view.draw();
            // Poke next actionObject
            if (actionObjectMap.resolve) actionObjectMap.resolve();
        },

        async onSaveButtonClick() {
            const result = await this.watchedModel.save();
            if (result instanceof Error) return;
            this.createAvatar();
            this.$toasted.success(window.vm.$t("saved", { name: this.watchedModel.getName() }), { className: "successToaster" });
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
            this.addBackground(model);
            this.addActionObject(model);
        },

        addBackground(model) {
            if (!(model instanceof File.RawClass) || !model.mime.startsWith("image")) return;
            this.watchedModel.file = model;
        },

        addActionObject(model) {
            // Has to be an Scene Object which can be passed into an action object
            // Should not be the same model as the current watched model to avoid recursion loop
            // has to be checked with the id because watched model can be an recursive proxy
            if (!(model instanceof SceneObject.RawClass) || model._id === this.watchedModel._id) return;
            const actionObject = ApiClient.store.addModel(new ActionObject.Model({
                position: [this.paper.view.center.x, this.paper.view.center.y],
                sceneObject: model
            }));
            this.watchedModel.actionObjects.push(actionObject);
        },

        async createAvatar() {
            if (!this.watchedModel._id) return;
            const svg = this.paper.project.exportSVG({ asString: true, bounds: "content" });
            await ApiClient.put(`/${this.watchedModel.collection}/${this.watchedModel._id}`, { content: svg });
            this.watchedModel.isCreatingAvatar = false;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/GraphicEditor.less"></style>
