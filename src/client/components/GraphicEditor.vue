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
            <Button name="arrange" :showLabel="false" :active="currentTool && currentTool.name === 'arrange'" @click="setTool('arrange')">
                <arrange-bring-forward-icon />
            </Button>
        </EditorHead>
        <div ref="canvasWrapper" class="canvasWrapper" @contextmenu.prevent="setTool(null)">
            <img ref="background"
                 style="display: none;"
                 v-if="model.file"
                 :src="`/files/${model.file._id}/avatar`"
                 @load="onBackgroundLoaded($event)"
            />
            <img v-for="(actionObjectMap, index) of actionObjectsMap"
                 style="display: none;"
                 :ref="`actionObjectBackground${actionObjectMap.actionObject._id}${index}`"
                 :key="`${actionObjectMap.actionObject._id}${index}`"
                 :src="`/files/${actionObjectMap.actionObject.sceneObject.file._id}/avatar`"
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
import Arrange from "~client/lib/Arrange";
import paper from "paper";
import { difference } from "~common/utils";

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
        }
    },
    data() {
        return {
            paper: new paper.PaperScope(),
            model: window.activeUser.editingModel,
            currentTool: null,
            isMounted: false,
            initialBackgroundLoadedPromise: null,
            initialBackgroundLoadedResolver: null,
            oldActionObjectMap: [],
            toolMap: {
                polyClickArea: PolyClickArea,
                move: Move,
                select: Select,
                arrange: Arrange
            }
        };
    },
    computed: {
        actionObjectsMap() {
            if (!this.model || !this.isMounted) return [];
            const map = [];

            const getRecursive = (model, ownerGroupModel) => {
                if (!model || !model.actionObjects) return;
                for (const actionObject of model.actionObjects) {
                    let promise = new Promise((resolve) => {
                        const prev = map[map.length - 1];
                        if (prev) prev.resolve = resolve;
                    });
                    if (!map[map.length - 1]) promise = null;
                    map.push({ actionObject, ownerGroupModel, promise, next: function() {
                        if (this.resolved) return;
                        this.resolved = true;
                        if (this.resolve) this.resolve();
                    } });
                    getRecursive(actionObject.sceneObject, actionObject);
                }
            };

            getRecursive(this.model);

            // We need to check if the length has really changed because the list
            // is new rendered every time a sub element has been changed
            if (map.length === this.oldActionObjectMap.length) return this.oldActionObjectMap;
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.oldActionObjectMap = map;
            return map;
        }
    },
    watch: {
        actionObjectsMap(newValue, prevValue) {
            if (newValue.length === prevValue.length) return;

            // Because the list is newly created, the already resolved promises
            // are no longer resolved. So we need to check if the promise was
            // already resolved before and resolve it again to avoid blocking
            // rendering after inserting a new item
            for (let index = 0; index < newValue.length; index++) {
                const newElement = newValue[index];
                const prevElement = prevValue[index];
                if (prevElement && prevElement.resolved) newElement.next();
            }

            // We need to map the action objects because the action object map
            // is new created. So a comparison on the map doesn't make sense.
            const newValueMapped = newValue.map((mapItem) => mapItem.actionObject);
            const prevValueMapped = prevValue.map((mapItem) => mapItem.actionObject);
            const deletedActionObjects = difference(prevValueMapped, newValueMapped);

            if (!deletedActionObjects.length) return;

            const paperItems = this.paper.project.activeLayer.getItems({
                recursive: true,
                match: (item) => {
                    if (deletedActionObjects.includes(item.model)) return true;
                    return false;
                }
            });

            for (const paperItem of paperItems) paperItem.remove();
        }
    },
    mounted() {
        this.initialBackgroundLoadedPromise = new Promise((resolve) => this.initialBackgroundLoadedResolver = resolve);
        this.paper.install(this);
        this.paper.setup(this.$refs.canvas);
        this.paper.settings.handleSize = 10;
        this.paper.project.activeLayer.applyMatrix = false;
        this.paper.project.currentStyle.strokeScaling = false;
        this.isMounted = true;

        // Add clickAreas
        this.setupClickAreas({ sceneObject: this.model }, this.paper.project.activeLayer);
    },
    async beforeDestroy() {
        if (this.currentTool) this.currentTool.remove();
        const hasChanges = this.model.hasChangesDeep();
        if (!this.$refs.editorHead.closeButtonClicked) {
            // Cases editor was closed unexpected
            if (hasChanges || this.model.isNew()) {
                const result = await this.model.save();
                if (!result) return;
                if (result instanceof Error) {
                    this.paper.project.clear();
                    return;
                }
                this.$toasted.success(window.vm.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
                this.createAvatar();
                this.paper.project.clear();
            }
        } else {
            if (!this.model.isNew()) {
                if (hasChanges) {
                    this.$toasted.info(window.vm.$t("discarded", { name: this.model.getName() }), { className: "infoToaster" });
                    this.model.discardDeep();
                }
            } else {
                this.model.destroy();
                this.$toasted.info(window.vm.$t("discarded", { name: this.model.getName() }), { className: "infoToaster" });
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
            if (this.paper.view.background) this.paper.view.background.remove();
            const raster = new this.paper.Raster(this.$refs.background);
            raster.position = this.paper.view.center;
            raster.scaling = this.paper.project.activeLayer.getScaling();
            raster.position = this.model.position;
            raster.sendToBack();
            this.model.position = [raster.position.x, raster.position.y];
            this.paper.view.background = raster;
            this.paper.view.draw();
            this.initialBackgroundLoadedResolver();
        },

        async onActionObjectBackgroundLoaded(actionObjectMap, index) {

            console.log(index);

            // If not the first one (which does not have an awaiting promise),
            // wait until the previous actionObject has fulfilled
            if (actionObjectMap.promise) await actionObjectMap.promise;

            console.log("sorted way...", index);

            const actionObject = actionObjectMap.actionObject;

            // Prevent vue from inserting a model each time it gets an id update
            const alreadyInserted = this.paper.project.getItem({ recursive: true, match: (child) => child.model === actionObject });
            if (alreadyInserted) {
                actionObjectMap.next();
                return;
            }

            const [group, rotator] = this.buildActionObjectGroup(actionObjectMap, index);

            this.setupClickAreas(actionObject, group, true);

            // Process sub action objects
            if (actionObjectMap.ownerGroupModel) {
                /** @type {InstanceType<import("paper")["Group"]>} */
                const ownerGroup = await this.getOwnerGroup(actionObjectMap);
                group.position = this.calcPosition(actionObjectMap.ownerGroupModel, ownerGroup, actionObject.position);
                group.locked = true;
                ownerGroup.insertChild(group.model.layer + 1, group);
            } else if (rotator) group.addChild(rotator);

            // Refresh view to be sure that the group is visible
            this.paper.view.draw();

            // Poke next actionObject
            actionObjectMap.next();
        },

        async onSaveButtonClick() {
            const result = await this.model.save();
            if (result instanceof Error) return;
            this.createAvatar();
            this.$toasted.success(window.vm.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        },

        /**
         * creates a new group for an action object with its background,
         * which musst already be loaded, and scales and rotates it.
         * If it is not in another group, the position will also be set.
         * It also creates a "rotator" anchor for the group.
         *
         * @param {object} actionObjectMap
         * @param {number} indexOfBackground
         * @returns {[InstanceType<import("paper")["Group"]>, InstanceType<import("paper")["Path"]>]}
         */
        buildActionObjectGroup(actionObjectMap, indexOfBackground) {
            const actionObject = actionObjectMap.actionObject;
            const group = new this.paper.Group({
                applyMatrix: false,
                scaling: this.paper.project.activeLayer.getScaling(),
                children: [
                    new this.paper.Raster(this.$refs[`actionObjectBackground${actionObject._id}${indexOfBackground}`][0])
                ]
            });
            group.model = actionObject;

            let rotator = null;
            if (!actionObjectMap.ownerGroupModel) {
                const endPoint = new this.paper.Point(group.bounds.topCenter.x, group.bounds.topCenter.y - 150);
                rotator = new this.paper.Path([group.bounds.topCenter, endPoint]);
                rotator.name = "rotator";
                group.position = this.calcPosition({ sceneObject: this.model }, this.paper.project.activeLayer, actionObject.position);
            }

            group.scale(actionObject.scale);
            group.rotation = actionObject.rotation;

            return [group, rotator];
        },

        /**
         * Calculates the position of an action object within a group relative
         * to the rasters position (Raster has to be already loaded and the first
         * child of the group).
         *
         * @param {import("~client/models/GameObject")} containerModel
         * @param {InstanceType<import("paper")["Group"]>} group
         * @param {[number, number]} position
         * @returns {InstanceType<import("paper")["Point"]>}
         */
        calcPosition(containerModel, group, position) {
            return group.children[0].position.add(new this.paper.Point(position).subtract(new this.paper.Point(containerModel.sceneObject.position)));
        },

        /**
         * Calculates the group which should hold the current action object.
         * It also waits until this group is rendered.
         *
         * @param {object} theActionObjectMap
         * @returns {Promise<InstanceType<import("paper")["Group"]>>}
         */
        getOwnerGroup(theActionObjectMap) {
            return new Promise((resolve) => {
                const ownerGroupInterval = setInterval(() => {
                    const ownerGroup = this.paper.project.getItem({
                        recursive: true,
                        match: (child) => child.model === theActionObjectMap.ownerGroupModel
                    });

                    if (ownerGroup) {
                        clearInterval(ownerGroupInterval);
                        resolve(ownerGroup);
                    }
                });
            });
        },

        async setupClickAreas(model, container, locked = false) {
            await this.initialBackgroundLoadedPromise;

            for (const clickArea of model.sceneObject.clickAreas) {
                const path = PolyClickArea.build(this.paper, clickArea.shape);
                path.model = clickArea;
                path.position = this.calcPosition(model, container, clickArea.position);
                path.locked = locked;
                container.insertChild(clickArea.layer + 1, path);
            }
        },

        setTool(toolName) {
            if (this.currentTool || typeof toolName === "string") {
                let toolToSet = null;
                if (toolName in this.toolMap && toolName !== this.currentTool?.name) toolToSet = new this.toolMap[toolName](this.paper, this.model);
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
            this.model.file = model;
        },

        addActionObject(model) {
            // Has to be an Scene Object which can be passed into an action object
            // Should not be the same model as the current watched model to avoid recursion loop
            // has to be checked with the id because watched model can be an recursive proxy
            if (!(model instanceof SceneObject.RawClass) || model._id === this.model._id) return;

            const actionObjectAmountBefore = this.actionObjectsMap.length;
            const actionObject = ApiClient.store.addModel(new ActionObject.Model({
                position: [this.paper.view.center.x, this.paper.view.center.y],
                sceneObject: model,
                layer: this.actionObjectsMap.length
            }));
            this.model.actionObjects.push(actionObject);
            const actionObjectAmountAfter = this.actionObjectsMap.length;

            // To be able to find the last action object in the map, we need to
            // know how many objects were added by the current actionObject and
            // subtract that amount from the length.
            const actionObjectAmountDifference = actionObjectAmountAfter - actionObjectAmountBefore;

            // resolve the last known promise
            const actionObjectsMap = this.actionObjectsMap;
            const lastActionObject = actionObjectsMap[actionObjectsMap.length - actionObjectAmountDifference - 1];
            if ((actionObjectsMap.length - 2) >= 0 && lastActionObject) lastActionObject.next();
        },

        async createAvatar() {
            if (!this.model._id) return;
            /** @type {HTMLCanvasElement} */
            const canvas = this.$refs.canvas;
            this.model.loadingStatus = -1;
            canvas.toBlob((blob) => {
                if (!blob) return;
                const formData = new FormData();
                formData.append('file', blob, this.model._id);
                ApiClient.upload("PUT", `/${this.model.collection}/${this.model._id}`, {
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
            }, "image/png");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/GraphicEditor.less"></style>
