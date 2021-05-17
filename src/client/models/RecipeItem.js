import { RecipeItemMixinClass } from "~common/models/RecipeItem";
import Item from "~client/models/Item";
import { unCapitalize } from "~common/utils";
import ApiClient from "~client/lib/ApiClient";

const CommonItemRecipeItem = RecipeItemMixinClass(Item.RawClass);
export default Item.RawClass.buildClientExport(class RecipeItem extends CommonItemRecipeItem {

    getAvatar() {
        const object = this.object;
        if (!object) return null;
        if (object === this.knowledge) return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
        if (object === this.label) return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
        if (object === this.sceneObject) return object.getAvatar();
        if (object === this.clickArea) return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
        if (object === this.actionObject) return object.sceneObject.getAvatar();
        if (object === this.scene) return object.getAvatar();
        if (object === this.file) return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
        return null;
    }

    getOverlayIcons() {
        const object = this.object;
        if (!object) return "";
        if (object === this.knowledge) return "head-lightbulb-icon";
        if (object === this.label) return "label-icon";
        if (object === this.sceneObject) return "ufo-icon";
        if (object === this.clickArea) return "cursor-default-click-icon";
        if (object === this.actionObject) return "movie-open-icon";
        if (object === this.scene) return "theater-icon";
        if (object === this.file) return "file-document-icon";
        return "";
    }

    get object() {
        return this.file || this.scene || this.actionObject || this.clickArea || this.sceneObject || this.knowledge || this.label;
    }

    set object(value) {
        const that = ApiClient.store.getModelById(this.dataCollectionName, this._dummyId || this._id) || this;

        const setAllOtherToNull = (otherThan) => {
            if (otherThan !== "Knowledge") that.knowledge = null;
            if (otherThan !== "Label") that.label = null;
            if (otherThan !== "SceneObject") that.sceneObject = null;
            if (otherThan !== "ActionObject") that.actionObject = null;
            if (otherThan !== "ClickArea") that.clickArea = null;
            if (otherThan !== "File") that.file = null;
            if (otherThan !== "Scene") that.scene = null;
        };

        setAllOtherToNull(value?.className);
        if (value) {
            that[unCapitalize(value.className)] = value;
            that.amount = Math.min(that.amount, this.getMaximumAmount());
        }
    }

    @CommonItemRecipeItem.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonItemRecipeItem.action("restore", { type: "component", name: "delete-restore-icon" }, () => false)
    @CommonItemRecipeItem.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
