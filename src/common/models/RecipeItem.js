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
        static dataCollectionName = "recipeItems";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
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
            knowledge: {
                type: Schema.Types.ObjectId,
                ref: "Knowledge",
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
            return this.isExistent() ? 1 : 0;
        }

        getMaximumAmount() {
            return this.isUnique() ? 1 : Infinity;
        }

        isExistent() {
            return Boolean(this.scene) || Boolean(this.file) || Boolean(this.knowledge);
        }

        isUnique() {
            const isScene = Boolean(this.scene);
            const isFile = Boolean(this.file);
            const isActionObject = Boolean(this.actionObject);
            const isSceneObject = Boolean(this.sceneObject);
            const isKnowledge = Boolean(this.knowledge);

            const inScene = this.location === "scene";
            return isScene || isFile || isActionObject || isSceneObject && inScene || isKnowledge;
        }

        canBeSpecifiedToActionObject() {
            return this.amount <= 1;
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
