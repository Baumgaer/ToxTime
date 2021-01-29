import Tool from "~client/lib/Tool";

export default class Select extends Tool {

    name = "select";

    hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
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

        if (hitResult.item instanceof this.paper.Group) {
            const maxDistance = 20;
            if (event.point.getDistance(hitResult.item.firstChild.bounds.topLeft) < maxDistance) {
                console.log("topLeft");
            } else if (event.point.getDistance(hitResult.item.firstChild.bounds.topRight) < maxDistance) {
                console.log("topRight");
            } else if (event.point.getDistance(hitResult.item.firstChild.bounds.bottomRight) < maxDistance) {
                console.log("bottomRight");
            } else if (event.point.getDistance(hitResult.item.firstChild.bounds.bottomLeft) < maxDistance) {
                console.log("bottomLeft");
            } else if (hitResult.type === "pixel") hitResult.item.translate(event.delta);
        } else if (hitResult.type === "segment") {
            // Move selection point
            hitResult.segment.point = event.point;
        } else if (hitResult.type === "fill") {
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

    remove() {
        super.remove();
        if (this.selection) this.selection.item.selected = false;
    }
}
