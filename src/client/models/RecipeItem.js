import { RecipeItemMixinClass } from "~common/models/RecipeItem";
import Item from "~client/models/Item";
import { unCapitalize } from "~common/utils";
import ApiClient from "~client/lib/ApiClient";

const CommonItemRecipeItem = RecipeItemMixinClass(Item.RawClass);
export default Item.RawClass.buildClientExport(class RecipeItem extends CommonItemRecipeItem {

    getAvatar() {
        const object = this.object;
        if (!object) return null;
        if (object === this.scene) return object.getAvatar();
        if (object === this.sceneObject) return object.getAvatar();
        if (object === this.actionObject) return object.sceneObject.getAvatar();
        return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
    }

    getOverlayIcons() {
        const object = this.object;
        if (!object) return "";
        return object.getIcon();
    }

    getOverwritableFields(lesson) {
        const overwriteObject = lesson && lesson.getOverwrite(this, "object");
        const overwriteAmount = lesson && lesson.getOverwrite(this, "amount");

        const amountValue = overwriteAmount ?? this.amount;
        const objectValue = overwriteObject ? ApiClient.store.getModelById(overwriteObject.split("_")[0], overwriteObject.split("_")[1]) : this.object;

        const overwritableFields = objectValue.getOverwritableFields(lesson);
        const overwritableAmountField = overwritableFields.find((field) => field.name === "amount");
        const overwritableObjectField = overwritableFields.find((field) => field.name === "object");

        const amountField = {
            ...(overwritableAmountField ?? {}),
            name: "amount",
            type: 'number',
            value: amountValue,
            min: this.getMinimumAmount(),
            max: this.getMaximumAmount(),
            disabled: !objectValue.canOverwriteAmount()
        };

        const objectField = {
            ...(overwritableObjectField ?? {}),
            name: "object",
            type: 'model',
            value: objectValue,
            disabled: !objectValue.canOverwriteObject()
        };

        const fields = [];
        for (const field of [...overwritableFields, amountField, objectField]) {
            if (fields.includes(field)) continue;
            if (field.name === "amount") {
                fields.push(amountField);
            } else if (field.name === "object") {
                fields.push(objectField);
            } else fields.push(field);
        }

        return fields;
    }

    get object() {
        return this.file || this.scene || this.actionObject || this.clickArea || this.sceneObject || this.knowledge || this.speechBubble || this.recipe || this.label;
    }

    set object(value) {
        const that = ApiClient.store.getModelById(this.dataCollectionName, this._dummyId || this._id) || this;

        const setAllOtherToNull = (otherThan) => {
            if (otherThan !== "Recipe") that.recipe = null;
            if (otherThan !== "Knowledge") that.knowledge = null;
            if (otherThan !== "SpeechBubble") that.speechBubble = null;
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
