export default class Move {

    name = "move";

    /** @type {import("paper")} */
    paper = null;

    /** @type {import("paper")["view"]["onMouseDrag"]} */
    originalOnMouseDrag = null;

    /**
     * Creates an instance of Move.
     *
     * @param {import("paper")} paper
     * @memberof Move
     */
    constructor(paper) {
        this.paper = paper;
        this.originalOnMouseDrag = paper.view.onMouseDrag;
        paper.view.onMouseDrag = this.onMouseDrag.bind(this);
    }

    /**
     * Translates the whole view with the current mouse position
     *
     * @param {import("paper")["MouseEvent"]} event
     * @memberof Move
     */
    onMouseDrag(event) {
        console.log(event.target);
        this.paper.view.translate(event.delta);
    }

    remove() {
        this.paper.view.onMouseDrag = this.originalOnMouseDrag;
    }
}
