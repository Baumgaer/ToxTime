import { Schema } from "mongoose";
import { union, difference } from "~common/utils";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Lesson & T}
 */
export function LessonMixinClass(MixinClass) {
    class Lesson extends MixinClass {

        static className = "Lesson";
        static collection = "lessons";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `Lesson`
            },
            description: {
                type: String,
                default: ""
            },
            inventory: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "SceneObject", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: []
            },
            scenes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Scene", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: []
            },
            excludesRecipes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Recipe", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: []
            },
            autoDetectedRecipes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Recipe", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: []
            },
            addedRecipes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Recipe", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: []
            }
        };

        getSubObjects() {
            return [...this.scenes, ...this.inventory];
        }

        getRecipes() {
            return difference(union(this.autoDetectedRecipes, this.addedRecipes), this.excludesRecipes);
        }
    }
    return Lesson;
}
