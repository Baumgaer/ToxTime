export default class Select {

    name = "select";

    /** @type {import("paper")} */
    paper = null;

    hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 3
    };

    /** @type {InstanceType<import("paper")["HitResult"]>} */
    selection = null;

    /** @type {import("paper")["view"]["onMouseDown"]} */
    originalOnMouseDown = null;

    /** @type {import("paper")["view"]["onMouseDrag"]} */
    originalOnMouseDrag = null;

    /** @type {import("paper")["view"]["onKeyDown"]} */
    originalOnKeyDown = null;

    /**
     * Creates an instance of Select.
     *
     * @param {import("paper")} paper
     * @memberof Select
     */
    constructor(paper) {
        this.paper = paper;
        this.originalOnMouseDown = paper.view.onMouseDown;
        this.originalOnMouseDrag = paper.view.onMouseDrag;
        this.originalOnKeyDown = paper.view.onKeyDown;

        paper.view.onMouseDown = this.onMouseDown.bind(this);
        paper.view.onMouseDrag = this.onMouseDrag.bind(this);
        paper.view.onKeyDown = this.onKeyDown.bind(this);
    }

    /**
     *
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Select
     */
    onMouseDown(event) {
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
    onMouseDrag(event) {
        if (!this.selection) return;
        const hitResult = this.paper.project.hitTest(event.point, this.hitOptions);
        if (hitResult.item !== this.selection.item) return;
        if (hitResult.type === "segment") {
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
    onKeyDown(event) {
        if (event.key !== "delete" || !this.selection) return;
        this.selection.item.remove();
        this.selection = null;
    }

    remove() {
        if (this.selection) this.selection.item.selected = false;
        this.paper.view.onMouseDown = this.originalOnMouseDown;
        this.paper.view.onMouseDrag = this.originalOnMouseDrag;
        this.paper.view.onKeyDown = this.originalOnKeyDown;
    }
}
