import Tool from "~client/lib/Tool";

export default class Arrange extends Tool {

    name = "arrange";

    /** @type {InstanceType<import("paper")["Item"]>} */
    itemToBringForward = null;

    /**
     * @inheritdoc
     *
     * @param {InstanceType<import("paper")["ToolEvent"]>} event
     * @memberof Arrange
     */
    onToolMouseDown(event) {
        if (event.event.button !== 0) return;
        if (this.itemToBringForward) {
            const oldIndex = this.itemToBringForward.index;
            this.itemToBringForward.insertAbove(event.item);
            this.paper.view.draw();
            const children = this.paper.project.activeLayer.children;
            for (let index = oldIndex; index < children.length; index++) {
                const child = children[index];
                child.model.layer = child.index;
            }
            this.itemToBringForward.selected = false;
            this.itemToBringForward = null;
        } else {
            this.itemToBringForward = event.item;
            event.item.selected = true;
        }
    }

    remove() {
        if (this.itemToBringForward) this.itemToBringForward.selected = false;
        this.itemToBringForward = null;
        super.remove();
    }
}
