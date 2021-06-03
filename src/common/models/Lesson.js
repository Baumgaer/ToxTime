import { Schema } from "mongoose";
import { union, difference, isValue, uniq } from "~common/utils";

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
        static dataCollectionName = "lessons";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
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
                default: [],
                ignoreOnIteration: true
            },
            scenes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Scene", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: [],
                ignoreOnIteration: true
            },
            excludedRecipes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Recipe", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: [],
                ignoreOnIteration: true
            },
            autoDetectedRecipes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Recipe", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: [],
                ignoreOnIteration: true
            },
            addedRecipes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Recipe", autopopulate: true }
                ],
                sticky: true,
                required: true,
                default: [],
                ignoreOnIteration: true
            },
            overwrites: {
                type: Schema.Types.Mixed,
                required: true,
                default: {}
            }
        };

        getOverwrite(id) {
            if (!(id in this.overwrites) || !isValue(this.overwrites[id])) this.overwrites[id] = {};
            return this.overwrites[id];
        }

        getSubObjects() {
            return [...this.scenes, ...this.inventory, ...this.getRecipes(true)];
        }

        getResources() {
            const resources = [...this.scenes, ...this.inventory];
            for (const model of [...this.scenes, ...this.inventory]) resources.push(...model.getResources());
            return uniq(resources);
        }

        getRecipes(filtered) {
            const activeRecipes = union(this.autoDetectedRecipes, this.addedRecipes);
            if (!filtered) return union(activeRecipes, this.excludedRecipes);
            return difference(activeRecipes, this.excludedRecipes);
        }
    }
    return Lesson;
}
