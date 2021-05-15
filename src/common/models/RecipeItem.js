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

        getMinimumAmount() {
            return Boolean(this.scene) || Boolean(this.file) ? 1 : 0;
        }

        getMaximumAmount() {
            const isScene = Boolean(this.scene);
            const isFile = Boolean(this.file);
            const isActionObject = Boolean(this.actionObject);
            const isSceneObject = Boolean(this.sceneObject);

            const inScene = this.location === "scene";
            const isUnique = isScene || isFile || isActionObject || isSceneObject && inScene;

            return isUnique ? 1 : Infinity;
        }

        getSubObjects() {
            return [this.object];
        }

        getName() {
            return this.object.name;
        }

    }
    return RecipeItem;
}
