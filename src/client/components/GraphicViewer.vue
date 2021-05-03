<template>
    <div ref="canvasWrapper" class="graphicViewer" @contextmenu="$emit('contextmenu', $event)">
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
        <canvas ref="canvas" resize @wheel="$emit('wheel', $event)"></canvas>
    </div>
</template>

<script>
import GameObject from "~client/models/GameObject";
import PolyClickArea from "~client/lib/PolyClickArea";
import { difference, capitalize } from "~common/utils";

import paper from "paper";

export default {
    props: {
        model: {
            type: GameObject.RawClass,
            required: true
        },
        showClickAreas: {
            type: Boolean,
            default: true
        },
        adjustToBorder: {
            type: Boolean,
            default: false
        },
        clickFunction: {
            type: Function,
            required: false,
            default: () => false
        }
    },
    data() {
        this.paper = new paper.PaperScope();
        return {
            isMounted: false,
            /** @type { null | Promise<void>} */
            initialBackgroundLoadedPromise: null,
            initialBackgroundLoadedResolver: null,
            lastAdjustmentWidth: window.innerWidth,
            oldActionObjectMap: []
        };
    },
    computed: {
        actionObjectsMap() {
            if (!this.model || !this.isMounted) return [];
            const map = [];

            const getRecursive = (model, ownerGroupModel) => {
                if (!model || !model.actionObjects) return;
                for (const actionObject of model.actionObjects) {
                    if (actionObject.deleted) continue;
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
        if (!this.model.file) this.initialBackgroundLoadedResolver();
        this.paper.setup(this.$refs.canvas);
        this.paper.activate();
        this.paper.settings.handleSize = 10;
        this.paper.project.activeLayer.applyMatrix = false;
        this.paper.project.currentStyle.strokeScaling = false;
        this.isMounted = true;
        window.paper = this.paper;

        this.paper.project.activeLayer.onClick = (event) => this.clickFunction(event, this.paper.project.activeLayer, null);

        // Add clickAreas
        this.setupClickAreas({ sceneObject: this.model }, this.paper.project.activeLayer);
        if (this.adjustToBorder) this.paper.view.onResize = this.adjustViewToBorder.bind(this);
    },
    methods: {
        onBackgroundLoaded() {
            this.paper.activate();
            if (this.paper.view.background) this.paper.view.background.remove();
            const raster = this.buildRaster(this.$refs.background);

            raster.position = this.model.position ? new this.paper.Point(...this.model.position) : this.paper.view.center;
            raster.scaling = this.paper.project.activeLayer.getScaling();

            raster.sendToBack();
            this.paper.view.background = raster;
            this.paper.view.update();
            this.adjustViewToBorder();
            this.initialBackgroundLoadedResolver();
        },

        async onActionObjectBackgroundLoaded(actionObjectMap, index) {
            // If not the first one (which does not have an awaiting promise),
            // wait until the previous actionObject has fulfilled
            await this.initialBackgroundLoadedPromise;
            if (actionObjectMap.promise) await actionObjectMap.promise;
            this.paper.activate();

            const actionObject = actionObjectMap.actionObject;
            // Prevent vue from inserting a model each time it gets an id update
            const alreadyInserted = this.paper.project.getItem({ recursive: true, match: (child) => child.model === actionObject });
            if (alreadyInserted) {
                actionObjectMap.next();
                return;
            }

            const [group, rotator, bounds] = this.buildActionObjectGroup(actionObjectMap, index);
            this.setupClickAreas(actionObject, group, this.showClickAreas);
            group.onClick = (event) => this.clickFunction(event, group, actionObject);

            // Process sub action objects
            if (actionObjectMap.ownerGroupModel) {
                /** @type {InstanceType<import("paper")["Group"]>} */
                const ownerGroup = await this.getOwnerGroup(actionObjectMap);
                this.paper.activate();
                group.position = this.calcPosition(actionObjectMap.ownerGroupModel, ownerGroup, actionObject.position);
                group.locked = true;
                ownerGroup.insertChild(group.model.layer + 1, group);
            } else if (rotator) {
                group.addChild(rotator);
                group.addChild(bounds);
            }

            // Refresh view to be sure that the group is visible
            this.paper.view.update();

            // Poke next actionObject
            actionObjectMap.next();
        },

        async adjustViewToBorder(args, force) {
            if (!force && !this.adjustToBorder) return;

            await this.initialBackgroundLoadedPromise;
            this.paper.activate();

            const paper = this.paper;
            const background = this.paper.view.background;
            const surroundingElement = this.$parent.$parent.$el;

            if (!background) return;

            const diffHeight = paper.view.scaling.multiply(Math.abs(surroundingElement.offsetHeight - background.size.height));
            const diffWidth = paper.view.scaling.multiply(Math.abs(surroundingElement.offsetWidth - background.size.width));

            let direction = "width";
            if (diffHeight < diffWidth) direction = "height";

            if (args) {
                paper.view.scale(1 + (args.delta[direction] / surroundingElement[`offset${capitalize(direction)}`]));
            } else paper.view.scale(paper.view.viewSize[direction] / background.size[direction]);
            paper.view.translate(paper.view.center.subtract(paper.view.background.position));
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

            const backgroundRef = this.$refs[`actionObjectBackground${actionObject._id}${indexOfBackground}`][0];
            const raster = this.buildRaster(backgroundRef);

            const group = new this.paper.Group({
                applyMatrix: false,
                scaling: this.paper.project.activeLayer.getScaling(),
                children: [ raster ]
            });
            group.model = actionObject;

            let rotator = null;
            let bounds = null;
            if (!actionObjectMap.ownerGroupModel) {
                const endPoint = new this.paper.Point(group.bounds.topCenter.x, group.bounds.topCenter.y - 250);
                rotator = new this.paper.Path([group.bounds.topCenter, endPoint]);
                rotator.name = "rotator";
                rotator.strokeColor = "white";
                rotator.opacity = 0.01;
                rotator.strokeWidth = 3;
                group.position = this.calcPosition({ sceneObject: this.model }, this.paper.project.activeLayer, actionObject.position);

                bounds = this.paper.Path.Rectangle(raster.bounds.topLeft, raster.bounds.bottomRight);
                bounds.name = "boundary";
                bounds.strokeColor = "white";
                bounds.opacity = 0.01;
                bounds.strokeWidth = 3;
            }

            group.scale(actionObject.scale);
            group.rotation = actionObject.rotation;

            return [group, rotator, bounds];
        },

        buildRaster(backgroundRef) {
            const raster = new this.paper.Raster(backgroundRef);

            // add fixed size to have a "fixed fixpoint" for action objects and
            // click areas. If this is not done and the background is a svg,
            // the background scales on window resize while all other objects
            // are on a fixed position
            const oldWidth = backgroundRef.naturalWidth;
            const oldHeight = backgroundRef.naturalHeight;
            const newWidth = 1080;
            const newHeight = parseInt(oldHeight) * newWidth / parseInt(oldWidth);
            raster.size = new this.paper.Size(newWidth, newHeight);

            return raster;
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
            this.paper.activate();
            for (const clickArea of model.sceneObject.clickAreas) {
                if (clickArea.deleted) continue;
                const path = PolyClickArea.build(this.paper, clickArea.shape, null, this.showClickAreas);
                path.position = this.calcPosition(model, container, clickArea.position);
                path.model = clickArea;
                path.locked = locked;
                path.onClick = (event) => this.clickFunction(event, path, clickArea);
                container.insertChild(clickArea.layer + 1, path);
            }
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/GraphicViewer.less"></style>
