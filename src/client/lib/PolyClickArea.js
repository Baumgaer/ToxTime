export default class PolyClickArea {

    name = "polyClickArea";

    /** @type {import("paper")} */
    paper = null;

    /** @type {InstanceType<import("paper")["Tool"]>} */
    tool = null;

    /** @type {InstanceType<import("paper")["Path"]>} */
    path = null;

    constructor(paper) {
        this.paper = paper;
        this.tool = new paper.Tool();
        this.tool.onMouseDown = this.onMouseDown.bind(this);
        this.tool.onMouseMove = this.onMouseMove.bind(this);
    }

    /**
     * @inheritdoc
     *
     * @param {import("paper")["ToolEvent"]} event
     * @memberof PolyClickArea
     */
    onMouseDown(event) {
        if (event.event.button !== 0) return;
        if (!this.path) {
            this.path = new this.paper.Path();
            this.path.closed = true;
            this.path.strokeColor = "red";
            this.path.strokeWidth = 3;
            this.path.fillColor = "white";
            this.path.fillColor.alpha = 0.1;
        }
        this.path.add(event.point);
    }

    /**
     * @inheritdoc
     *
     * @param {import("paper")["ToolEvent"]} event
     * @memberof PolyClickArea
     */
    onMouseMove(event) {
        if (!this.path) return this.onMouseDown(event);
        this.path.lastSegment.point = event.point;
    }

    remove() {
        this.path.removeSegment(this.path.lastSegment.index);
        this.tool.remove();
    }
}
