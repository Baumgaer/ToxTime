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
                unique: true,
                default: `Recipe`
            },
            description: {
                type: String,
                default: ""
            },
            input: {
                type: [{ type: Schema.Types.ObjectId, ref: "RecipeItem" }],
                required: true,
                default: [],
                dependant: true
            },
            transitionSettings: {
                type: {
                    delay: Number,
                    ingredientsExact: Boolean,
                    quantityExact: Boolean
                },
                required: true,
                default: {}
            },
            output: {
                type: [{ type: Schema.Types.ObjectId, ref: "RecipeItem" }],
                required: true,
                default: [],
                dependant: true
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
