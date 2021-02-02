import Tool from "~client/lib/Tool";
import { kebabCaseToCamelCase } from "~common/utils";

export default class Select extends Tool {

    name = "select";

    hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        bounds: true,
        tolerance: 50
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
        if (this.isGroup(hitResult)) hitResult.item = hitResult.item.parent;

        if (hitResult.item === this.selection?.item) {
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
            if (this.selection) this.selection.item.selected = false;
            hitResult.item.selected = true;
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
            delete hitTestOptions.bounds;
        }

        const hitResult = this.paper.project.hitTest(event.point, hitTestOptions);
        if (!hitResult) return;

        if (!this.currentDrag) this.currentDrag = hitResult;

        // Select the group of the hit item if the parent is a group
        if (this.isGroup(hitResult)) hitResult.item = hitResult.item.parent;
        if (hitResult.item !== this.selection.item) return;

        if (this.currentDrag.item instanceof this.paper.Group && this.currentDrag.type === "bounds") {
            if (this.currentDrag.name === "top-center") {
                // Rotate group
                const delta = event.point.subtract(this.currentDrag.item.position);
                this.currentDrag.item.rotation = delta.angle + 90;
            } else {
                // Scale actionObject
                const bounds = this.currentDrag.item.bounds;
                const hitPoint = bounds[kebabCaseToCamelCase(this.currentDrag.name)];
                const oppositePoint = this.currentDrag.item.bounds[kebabCaseToCamelCase(this.getOppositeBoundary(this.currentDrag.name))];
                const scaleFactor = (bounds.width - (hitPoint.x - event.point.x)) / bounds.width;
                this.currentDrag.item.scale(scaleFactor, oppositePoint);
                this.currentDrag.item.model.scale = this.currentDrag.item.model.scale * scaleFactor;
                this.currentDrag.item.model.position = [this.currentDrag.item.position.x, this.currentDrag.item.position.y];
            }
        } else if (this.currentDrag.type === "segment") {
            // Change point of a clickArea
            this.currentDrag.segment.point = event.point;
            this.currentDrag.item.model.shape[this.currentDrag.segment.point._owner.index] = [this.currentDrag.segment.point.x, this.currentDrag.segment.point.y];
            this.currentDrag.item.model.position = [this.currentDrag.item.position.x, this.currentDrag.item.position.y];
        } else if (["fill", "pixel"].includes(this.currentDrag.type)) {
            // Move clickArea or actionObject
            hitResult.item.translate(event.delta);
            hitResult.item.model.position = [hitResult.item.position.x, hitResult.item.position.y];
        }
    }

    onToolMouseUp() {
        this.currentDrag = null;
    }

    /**
     *
     *
     * @param {import("paper")["KeyEvent"]} event
     * @memberof Select
     */
    onToolKeyDown(event) {
        if (event.key !== "delete" || !this.selection) return;
        this.model[this.selection.item.model.collection].splice(this.model[this.selection.item.model.collection].indexOf(this.selection.item.model), 1);
        this.selection.item.remove();
        this.selection = null;
    }

    isGroup(hitResult) {
        if (!hitResult) return false;
        return !(hitResult.item instanceof this.paper.Group) && hitResult.item.parent instanceof this.paper.Group && !(hitResult.item.parent instanceof this.paper.Layer);
    }

    getOppositeBoundary(name) {
        const mapping = { top: "bottom", bottom: "top", left: "right", right: "left" };
        const directions = name.split("-");
        return `${mapping[directions[0]]}-${mapping[directions[1]]}`;
    }

    remove() {
        super.remove();
        if (this.selection) this.selection.item.selected = false;
    }
}
