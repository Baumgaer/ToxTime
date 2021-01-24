import Tool from "~client/lib/Tool";

export default class Move extends Tool {

    name = "move";

    /**
     * Translates the whole view with the current mouse position
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Move
     */
    onPaperMouseDrag(event) {
        this.paper.view.translate(event.delta);
    }

}
