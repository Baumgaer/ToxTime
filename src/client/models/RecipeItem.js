import { RecipeItemMixinClass } from "~common/models/RecipeItem";
import Item from "~client/models/Item";
import { unCapitalize } from "~common/utils";
import ApiClient from "~client/lib/ApiClient";

const CommonItemRecipeItem = RecipeItemMixinClass(Item.RawClass);
export default Item.RawClass.buildClientExport(class RecipeItem extends CommonItemRecipeItem {

    getAvatar() {
        const object = this.object;
        if (!object) return null;
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
        if (object === this.label) return "label-icon";
        if (object === this.sceneObject) return "ufo-icon";
        if (object === this.clickArea) return "cursor-default-click-icon";
        if (object === this.actionObject) return "movie-open-icon";
        if (object === this.scene) return "theater-icon";
        if (object === this.file) return "file-document-icon";
        return "";
    }

    get object() {
        return this.file || this.scene || this.actionObject || this.clickArea || this.sceneObject || this.label;
    }

    set object(value) {
        const that = ApiClient.store.getModelById(this.collection, this._dummyId || this._id) || this;

        const setAllOtherToNull = (otherThan) => {
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
            if (value.className === "Scene") that.amount = 1;
        }
    }

    get location() {
        if (this.locateInInventory) return "inventory";
        if (this.locateInHand) return "hand";
        if (!this.locateInActionObject) return "choose";
        return this.locateInActionObject;
    }

    set location(value) {
        const that = ApiClient.store.getModelById(this.collection, this._dummyId || this._id) || this;
        if (!value || value.className === "Inventory") {
            // Locate in inventory
            that.locateInInventory = true;
            that.locateInHand = false;
            that.locateInActionObject = null;
        } else if (value.className === "Scene") {
            // Predefined rule to force the user to select an actionObject
            that.locateInInventory = false;
            that.locateInHand = false;
            that.locateInActionObject = null;
            that.amount = Math.min(this.amount, 1);
        } else if (value.className === "ActionObject") {
            // Locate at the position of the given action object
            that.locateInInventory = false;
            that.locateInHand = false;
            that.locateInActionObject = value;
            that.amount = Math.min(this.amount, 1);
        } else if (value.className === "Hand") {
            // Locate in hand
            that.locateInActionObject = null;
            that.locateInInventory = false;
            that.locateInHand = true;
        }
    }

    @CommonItemRecipeItem.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonItemRecipeItem.action("restore", { type: "component", name: "delete-restore-icon" }, () => false)
    @CommonItemRecipeItem.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
