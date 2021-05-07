import { Schema } from "mongoose";

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
            location: {
                type: String,
                enum: ["inventory", "hand", "scene"],
                default: "inventory"
            }
        };

        getSubObjects() {
            return [this.object];
        }

    }
    return RecipeItem;
}
