import Tool from "~client/lib/Tool";

export default class Move extends Tool {

    name = "move";

    /**
     * Translates the whole view with the current mouse position
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Move
     */
    onToolMouseDrag(event) {
        this.paper.view.center = event.downPoint.add(this.paper.view.center.subtract(event.point));
    }

}
