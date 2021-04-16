import { Schema } from "mongoose";
import { unCapitalize } from "~common/utils";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {RecipeItem & T}
 */
export function RecipeItemMixinClass(MixinClass) {
    class RecipeItem extends MixinClass {

        static className = "RecipeItem";
        static collection = "recipeItems";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            actionObject: {
                reverseDependant: false,
                sticky: true
            },
            sceneObject: {
                reverseDependant: false,
                sticky: true
            },
            label: {
                type: Schema.Types.ObjectId,
                ref: "Label",
                autopopulate: true,
                sticky: true,
                required: false,
                default: null
            },
            clickArea: {
                type: Schema.Types.ObjectId,
                ref: "ClickArea",
                autopopulate: true,
                sticky: true,
                required: false,
                default: null
            },
            file: {
                type: Schema.Types.ObjectId,
                ref: "File",
                autopopulate: true,
                sticky: true,
                required: false,
                default: null
            },
            scene: {
                type: Schema.Types.ObjectId,
                ref: "Scene",
                autopopulate: true,
                sticky: true,
                required: false,
                default: null
            },
            locateInInventory: {
                type: Boolean,
                default: true
            },
            locateInActionObject: {
                type: Schema.Types.ObjectId,
                ref: "ActionObject",
                default: null,
                autopopulate: true,
                sticky: true
            }
        };

        get object() {
            return this.file || this.scene || this.actionObject || this.clickArea || this.sceneObject || this.label;
        }

        set object(value) {

            const setAllOtherToNull = (otherThan) => {
                if (otherThan !== "Label") this.label = null;
                if (otherThan !== "SceneObject") this.sceneObject = null;
                if (otherThan !== "ActionObject") this.actionObject = null;
                if (otherThan !== "ClickArea") this.clickArea = null;
                if (otherThan !== "File") this.file = null;
                if (otherThan !== "Scene") this.scene = null;
            };

            setAllOtherToNull(value?.className);
            if (value) this[unCapitalize(value.className)] = value;
        }

        get location() {
            if (this.locateInInventory) return "inventory";
            return this.locateInActionObject;
        }

        set location(value) {
            if (!value || value.className !== "ActionObject") {
                this.locateInInventory = true;
                this.locateInActionObject = null;
            } else {
                this.locateInActionObject = value;
                this.locateInInventory = false;
            }
        }

    }
    return RecipeItem;
}
