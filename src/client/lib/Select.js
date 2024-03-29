import Tool from "~client/lib/Tool";
import { kebabCaseToCamelCase } from "~common/utils";

export default class Select extends Tool {

    name = "select";

    hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        bounds: false,
        tolerance: 15
    };

    /** @type {InstanceType<import("paper")["HitResult"]>} */
    selection = null;

    /** @type {InstanceType<import("paper")["ToolEvent"]>} */
    currentDrag = null;

    /**
     *
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Select
     */
    onToolMouseDown(event) {
        let hitResult = this.paper.project.hitTest(event.point, this.hitOptions);
        if (!hitResult || hitResult.item === this.paper.view.background) return;

        // Select the group of the hit item if the parent is a group
        if (hitResult?.item.name === "boundary") hitResult.isScale = true;
        if (hitResult?.item.name === "rotator") hitResult.isRotation = true;
        if (this.isGroup(hitResult)) hitResult.item = hitResult.item.parent;

        if (hitResult.item === this.selection?.item) {
            if (hitResult.isScale || hitResult.isRotation) return;
            // Modify a clickArea
            if (event.modifiers.shift && hitResult.type == 'segment') {
                // Remove point from a clickArea
                hitResult.segment.remove();
                hitResult.item.model.shape.splice(hitResult.segment.index, 1);
                hitResult.item.model.position = [hitResult.item.position.x, hitResult.item.position.y];
            } else if (hitResult.type === "stroke") {
                // Add point to a clickArea
                const index = hitResult.location.index + 1;
                hitResult.item.insert(index, event.point);
                hitResult.item.model.shape.splice(index, 0, [event.point.x, event.point.y]);
                hitResult.item.model.position = [hitResult.item.position.x, hitResult.item.position.y];
            }
        } else {
            // Just select the click item
            if (this.selection) this.selection.item.model.isSelected = false;
            hitResult.item.model.isSelected = true;
            this.selection = hitResult;
        }
    }

    /**
     *
     *
     * @param {InstanceType<import("paper")["ToolEvent"]>} event
     * @memberof Select
     */
    onToolMouseDrag(event) {
        if (!this.selection) return;

        // Do not hit bounds if the selection is not a group because of confusion
        // of the hit test (tries to hit strokes and bounds which are actually
        // the same object with different properties)
        let hitTestOptions = this.hitOptions;
        if (!(this.selection.item instanceof this.paper.Group)) {
            hitTestOptions = Object.assign({}, this.hitOptions);
            hitTestOptions.bounds = false;
        } else {
            hitTestOptions = Object.assign({}, this.hitOptions);
            hitTestOptions.tolerance = 25;
        }

        if (!this.currentDrag) {
            const hitResult = this.selection.item.hitTest(event.point, hitTestOptions);
            if (!hitResult) return;

            // Select the group of the hit item if the parent is a group
            if (hitResult.item.name === "boundary") hitResult.isScale = true;
            if (hitResult.item.name === "rotator") hitResult.isRotation = true;
            if (this.isGroup(hitResult)) hitResult.item = hitResult.item.parent;
            if (hitResult.item !== this.selection.item) return;

            // Store in global variable to ensure smooth behavior and have access
            // to data in other methods without passing the information to every method
            this.currentDrag = hitResult;
        }

        if (this.currentDrag.item instanceof this.paper.Group && (this.currentDrag.isScale || this.currentDrag.isRotation)) {
            if (this.currentDrag.segment?.index === 1) {
                this.currentDrag.name = "top-left";
            } else if (this.currentDrag.segment?.index === 2) {
                this.currentDrag.name = "top-right";
            } else if (this.currentDrag.segment?.index === 3) {
                this.currentDrag.name = "bottom-right";
            } else this.currentDrag.name = "bottom-left";
            if (this.currentDrag.isRotation) {
                this.rotateGroup(event);
            } else this.scaleGroup(event);
        } else if (this.currentDrag.type === "segment") {
            this.moveClickAreaPoint(event);
        } else if (["fill", "pixel"].includes(this.currentDrag.type)) this.moveItem(event);
    }

    onToolMouseUp() {
        // Reset the current drag, when mouse is up again to be able to determine
        // a new current drag
        this.currentDrag = null;
    }

    /**
     *
     *
     * @param {import("paper")["KeyEvent"]} event
     * @memberof Select
     */
    onToolKeyDown(event) {
        if (document.activeElement?.tagName === "INPUT") return;
        super.onToolKeyDown(event);
        if (event.key !== "delete" || !this.selection) return;

        const removedModel = this.selection.item.model;
        const removedModelCollection = removedModel.dataCollectionName;

        this.model[removedModelCollection].splice(this.model[removedModelCollection].indexOf(removedModel), 1);
        removedModel.isSelected = false;
        if (removedModel.isNew()) removedModel.destroy();
        this.selection.item.remove();
        this.selection = null;
    }

    moveItem(event) {
        this.currentDrag.item.translate(event.delta);
        this.currentDrag.item.model.position = [this.currentDrag.item.position.x, this.currentDrag.item.position.y];
    }

    moveClickAreaPoint(event) {
        this.currentDrag.segment.point = event.point;
        this.currentDrag.item.model.shape[this.currentDrag.segment.point._owner.index] = [this.currentDrag.segment.point.x, this.currentDrag.segment.point.y];
        this.currentDrag.item.model.position = [this.currentDrag.item.position.x, this.currentDrag.item.position.y];
    }

    rotateGroup(event) {
        const delta = event.point.subtract(this.currentDrag.item.position);
        this.currentDrag.item.rotation = delta.angle + 90;
        this.currentDrag.item.model.rotation = this.currentDrag.item.rotation;
    }

    scaleGroup(event) {
        if (!this.currentDrag.name) return;
        const bounds = this.currentDrag.item.bounds;
        const hitPoint = bounds[this.getBoundaryName(this.currentDrag.name)];
        const oppositePoint = this.currentDrag.item.bounds[this.getBoundaryName(this.currentDrag.name, true)];

        const oldHypLength = Math.abs(oppositePoint.subtract(hitPoint).length);
        const newHypLength = Math.abs(oppositePoint.subtract(event.point).length);
        const diff = oldHypLength - newHypLength;

        const scaleFactor = (oldHypLength - diff) / oldHypLength;
        this.currentDrag.item.scale(scaleFactor, oppositePoint);
        this.currentDrag.item.model.scale = this.currentDrag.item.model.scale * scaleFactor;
        this.currentDrag.item.model.position = [this.currentDrag.item.position.x, this.currentDrag.item.position.y];
    }

    isGroup(hitResult) {
        if (!hitResult) return false;
        return !(hitResult.item instanceof this.paper.Group) && hitResult.item.parent instanceof this.paper.Group && !(hitResult.item.parent instanceof this.paper.Layer);
    }

    getBoundaryName(name, opposite) {
        const mapping = ["top-left", "top-right", "bottom-right", "bottom-left"];
        const offset = Math.round(Math.ceil(this.currentDrag.item.rotation / 10) * 10 / 90) + (opposite ? 2 : 0);
        const index = (mapping.indexOf(name) + offset) % 4;

        return kebabCaseToCamelCase(mapping[index]);
    }

    remove() {
        super.remove();
        if (this.selection) {
            this.selection.item.model.isSelected = false;
            this.selection.item.selected = false;
        }
    }
}
