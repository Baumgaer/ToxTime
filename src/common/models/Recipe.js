import { Schema } from "mongoose";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Recipe & T}
 */
export function RecipeMixinClass(MixinClass) {
    class Recipe extends MixinClass {

        static className = "Recipe";
        static collection = "recipes";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `Recipe`
            },
            description: {
                type: String,
                default: ""
            },
            labels: {
                type: [{ type: Schema.Types.ObjectId, ref: "Label" }],
                default: [],
                required: true,
                sticky: true
            },
            sceneObjects: {
                type: [{ type: Schema.Types.ObjectId, ref: "SceneObject" }],
                default: [],
                required: true,
                sticky: true
            },
            actionObjects: {
                type: [{ type: Schema.Types.ObjectId, ref: "ActionObject" }],
                default: [],
                required: true,
                sticky: true
            },
            clickArea: {
                type: Schema.Types.ObjectId,
                ref: "ClickArea",
                sticky: true
            }
        };

        get objects() {
            const objects = [];
            if (this.clickArea) objects.push(this.clickArea);
            return objects.concat(this.actionObjects).concat(this.sceneObjects).concat(this.labels);
        }

    }
    return Recipe;
}
