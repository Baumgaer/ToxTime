import { Schema } from "mongoose";
import { flatten, compact } from "~common/utils";

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
                autopopulate: true,
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
                autopopulate: true,
                dependant: true
            }
        };

        get objects() {
            return [...this.input, ...this.output];
        }

        getSubObjects(real) {
            if (real) return this.objects;
            return compact(flatten(this.objects.map((object) => object?.getSubObjects?.())));
        }

    }
    return Recipe;
}
