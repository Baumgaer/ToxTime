import Tool from "~client/lib/Tool";
import ClickAreaClientExport from "~client/models/ClickArea";
import { Store } from "~client/lib/Store";

export default class PolyClickArea extends Tool {

    name = "polyClickArea";

    /** @type {InstanceType<import("paper")["Path"]>} */
    path = null;

    /**
     * Creates a visible path in its default form
     *
     * @static
     * @param {import("paper")} paper
     * @param {number[]} pathPoints
     * @param {number[]} [position]
     * @param {boolean} [showStroke]
     * @returns {InstanceType<import("paper")["Path"]>}
     * @memberof PolyClickArea
     */
    static build(paper, pathPoints, position, showStroke = true) {
        const path = new paper.Path(pathPoints);
        path.closed = true;
        if (showStroke) {
            path.strokeColor = "red";
            path.strokeWidth = 3;
        }
        path.fillColor = "white";
        path.fillColor.alpha = 0.01;
        if (position) path.position = new paper.Point(...position);
        return path;
    }

    /**
     * @inheritdoc
     *
     * @param {InstanceType<import("paper")["ToolEvent"]>} event
     * @memberof PolyClickArea
     */
    onToolMouseDown(event) {
        if (event.event.button !== 0) return;
        if (!this.path) this.path = PolyClickArea.build(this.paper);
        this.path.add(event.point);
    }

    /**
     * @inheritdoc
     *
     * @param {import("paper")["ToolEvent"]} event
     * @memberof PolyClickArea
     */
    onToolMouseMove(event) {
        if (!this.path) return this.onToolMouseDown(event);
        this.path.lastSegment.point = event.point;
    }

    remove() {
        super.remove();
        if (!this.path) return;
        this.path.removeSegment(this.path.lastSegment.index);
        if (this.path.segments.length >= 3) {
            const store = Store.getInstance();
            const clickArea = store.addModel(new ClickAreaClientExport.Model({
                shape: this.path.segments.map((segment) => [segment.point.x, segment.point.y]),
                position: [this.path.position.x, this.path.position.y],
                layer: this.path.index
            }));
            this.model.clickAreas.push(clickArea);
            this.path.model = clickArea;
        } else this.path.remove();
    }
}
