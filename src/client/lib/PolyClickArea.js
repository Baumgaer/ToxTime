import Tool from "~client/lib/Tool";
import ClickAreaClientExport from "~client/models/ClickArea";

export default class PolyClickArea extends Tool {

    name = "polyClickArea";

    /** @type {InstanceType<import("paper")["Path"]>} */
    path = null;

    /**
     * @inheritdoc
     *
     * @param {import("paper")["ToolEvent"]} event
     * @memberof PolyClickArea
     */
    onToolMouseDown(event) {
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
    onToolMouseMove(event) {
        if (!this.path) return this.onToolMouseDown(event);
        this.path.lastSegment.point = event.point;
    }

    remove() {
        super.remove();
        if (!this.path) return;
        this.path.removeSegment(this.path.lastSegment.index);
        if (this.path.segments.length >= 3) {
            const clickArea = new ClickAreaClientExport.Model({
                shape: this.path.segments.map((segment) => [segment.point.x, segment.point.y])
            });
            this.model.clickAreas.push(clickArea);
            this.path.model = clickArea;
        } else this.path.remove();
    }
}
