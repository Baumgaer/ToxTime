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

    /**
     *
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Select
     */
    onToolMouseDown(event) {
        let hitResult = this.paper.project.hitTest(event.point, this.hitOptions);
        if (!hitResult || hitResult.item === this.paper.view.background) return;

        if (this.isGroup(hitResult)) hitResult.item = hitResult.item.parent;

        if (hitResult.item === this.selection?.item) {
            if (event.modifiers.shift) {
                if (hitResult.type == 'segment') hitResult.segment.remove();
                return;
            }
            if (hitResult.type === "stroke") hitResult.item.insert(hitResult.location.index + 1, event.point);
        } else {
            if (this.selection) this.selection.item.selected = false;
            hitResult.item.selected = true;
            this.selection = hitResult;
        }
    }

    /**
     *
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Select
     */
    onToolMouseDrag(event) {
        if (!this.selection) return;
        const hitResult = this.paper.project.hitTest(event.point, this.hitOptions);
        if (!hitResult) return;

        if (this.isGroup(hitResult)) hitResult.item = hitResult.item.parent;
        if (hitResult.item !== this.selection.item) return;

        if (hitResult.type === "bounds") {
            const bounds = hitResult.item.bounds;
            const hitPoint = bounds[kebabCaseToCamelCase(hitResult.name)];
            const oppositePoint = hitResult.item.bounds[kebabCaseToCamelCase(this.getOppositeBoundary(hitResult.name))];
            hitResult.item.scale((bounds.width - (hitPoint.x - event.point.x)) / bounds.width, oppositePoint);
        } else if (hitResult.type === "segment") {
            // Move selection point
            hitResult.segment.point = event.point;
        } else if (["fill", "pixel"].includes(hitResult.type)) {
            hitResult.item.translate(event.delta);
        }
    }

    /**
     *
     *
     * @param {import("paper")["KeyEvent"]} event
     * @memberof Select
     */
    onToolKeyDown(event) {
        if (event.key !== "delete" || !this.selection) return;
        this.selection.item.remove();
        this.selection = null;
    }

    isGroup(hitResult) {
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
