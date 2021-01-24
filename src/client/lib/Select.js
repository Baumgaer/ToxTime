import Tool from "~client/lib/Tool";

export default class Select extends Tool {

    name = "select";

    hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 3
    };

    /** @type {InstanceType<import("paper")["HitResult"]>} */
    selection = null;

    /**
     *
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Select
     */
    onPaperMouseDown(event) {
        const hitResult = this.paper.project.hitTest(event.point, this.hitOptions);
        if (!hitResult || hitResult.item === this.paper.view.background) return;
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
    onPaperMouseDrag(event) {
        if (!this.selection) return;
        const hitResult = this.paper.project.hitTest(event.point, this.hitOptions);
        if (hitResult.item !== this.selection.item) return;
        if (hitResult.type === "segment") {
            // Move selection point
            hitResult.segment.point = event.point;
        } else if (hitResult.type === "fill") {
            hitResult.item.translate(event.delta);
        }
        console.log(hitResult.item.model);
    }

    /**
     *
     *
     * @param {import("paper")["KeyEvent"]} event
     * @memberof Select
     */
    onPaperKeyDown(event) {
        if (event.key !== "delete" || !this.selection) return;
        this.selection.item.remove();
        this.selection = null;
    }

    remove() {
        super.remove();
        if (this.selection) this.selection.item.selected = false;
    }
}
