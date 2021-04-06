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
            }
        };

        get object() {
            return this.actionObject || this.sceneObject || this.label || this.clickArea;
        }

        set object(value) {

            const setAllOtherToNull = (otherThan) => {
                if (otherThan !== "Label") this.label = null;
                if (otherThan !== "SceneObject") this.sceneObject = null;
                if (otherThan !== "ActionObject") this.actionObject = null;
                if (otherThan !== "ClickArea") this.clickArea = null;
            };

            if (!value) return setAllOtherToNull();
            this[unCapitalize(value.className)] = value;
            setAllOtherToNull(value.className);
        }

    }
    return RecipeItem;
}
