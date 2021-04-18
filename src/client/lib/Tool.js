export default class Tool {

    /** @type {string} */
    name = "tool";

    /** @type {import("paper")} */
    paper = null;

    /** @type {import("~client/lib/ClientModel").default} */
    model = null;

    /** @type {InstanceType<import("paper")["Tool"]>} */
    tool = null;

    /** @type {Record<string, Function | null>} */
    originalEvents = {
        onClick: null,
        onDoubleClick: null,
        onFrame: null,
        onMouseDown: null,
        onMouseDrag: null,
        onMouseEnter: null,
        onMouseLeave: null,
        onMouseMove: null,
        onMouseUp: null,
        onKeyDown: null,
        onKeyUp: null,
        onResize: null
    };

    /**
     * Creates an instance of Tool.
     *
     * @param {import("paper")} paper
     * @param {import("~client/lib/ClientModel").default} model
     * @memberof Tool
     */
    constructor(paper, model, setNewToolFunc) {
        this.paper = paper;
        this.model = model;
        this.tool = new paper.Tool();
        this.setNewTool = setNewToolFunc;
        for (const key in this.originalEvents) {
            if (Object.hasOwnProperty.call(this.originalEvents, key)) {
                const eventFunction = paper.view[key];
                this.originalEvents[key] = eventFunction;
                const eventFuncName = key.substr(2);
                paper.view[key] = this[`onPaper${eventFuncName}`].bind(this);
                this.tool[key] = this[`onTool${eventFuncName}`].bind(this);
            }
        }
        this.tool.activate();
    }

    // Just some dummy functions
    onPaperMouseDown(event) {
        if (this.originalEvents.onMouseDown) this.originalEvents.onMouseDown(event);
    }

    onPaperMouseUp(event) {
        if (this.originalEvents.onMouseUp) this.originalEvents.onMouseUp(event);
    }

    onPaperMouseMove(event) {
        if (this.originalEvents.onMouseMove) this.originalEvents.onMouseMove(event);
    }

    onPaperMouseDrag(event) {
        if (this.originalEvents.onMouseDrag) this.originalEvents.onMouseDrag(event);
    }

    onPaperMouseEnter(event) {
        if (this.originalEvents.onMouseEnter) this.originalEvents.onMouseEnter(event);
    }

    onPaperMouseLeave(event) {
        if (this.originalEvents.onMouseLeave) this.originalEvents.onMouseLeave(event);
    }

    onPaperClick(event) {
        if (this.originalEvents.onClick) this.originalEvents.onClick(event);
    }

    onPaperDoubleClick(event) {
        if (this.originalEvents.onDoubleClick) this.originalEvents.onDoubleClick(event);
    }

    onPaperKeyDown(event) {
        if (this.originalEvents.onKeyDown) this.originalEvents.onKeyDown(event);
    }

    onPaperKeyUp(event) {
        if (this.originalEvents.onKeyUp) this.originalEvents.onKeyUp(event);
    }

    onPaperFrame(event) {
        if (this.originalEvents.onFrame) this.originalEvents.onFrame(event);
    }

    onPaperResize(event) {
        if (this.originalEvents.onResize) this.originalEvents.onResize(event);
    }

    onToolMouseDown() { }

    onToolMouseUp() { }

    onToolMouseMove() { }

    onToolMouseDrag() { }

    onToolMouseEnter() { }

    onToolMouseLeave() { }

    onToolClick() { }

    onToolDoubleClick() { }

    onToolKeyDown(event) {
        if (event.key === "escape" && this.setNewTool) this.setNewTool?.(null);
    }

    onToolKeyUp() { }

    onToolFrame() { }

    onToolResize() { }


    remove() {
        this.tool.remove();
        for (const key in this.originalEvents) {
            if (Object.hasOwnProperty.call(this.originalEvents, key)) {
                const eventFunction = this.originalEvents[key];
                if (!eventFunction) continue;
                this.paper.view[key] = eventFunction;
            }
        }
    }
}
