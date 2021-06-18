import { Schema } from "mongoose";
import { union, difference, isValue, uniq, escape } from "~common/utils";

/**
 * @typedef {import("~common/lib/BaseModel")["default"]} BaseModel
 */

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
                default: "",
                set: escape
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
            entities: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Entity", autopopulate: true }
                ],
                required: true,
                default: [],
                dependant: true
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
            goals: {
                type: [
                    {
                        type: new Schema({
                            "name_de-de": {
                                type: String,
                                required: true,
                                default: "",
                                set: escape
                            },
                            "name_en-us": {
                                type: String,
                                required: true,
                                default: "",
                                set: escape
                            },
                            points: {
                                type: Number,
                                required: true,
                                default: 0
                            }
                        })
                    }
                ],
                required: true,
                default: []
            },
            overwrites: {
                type: Schema.Types.Mixed,
                required: true,
                default: {}
            }
        };

        getEntity(model) {
            for (const entity of this.entities) {
                if (!entity.getResources().includes(model)) continue;
                return entity;
            }
            return null;
        }

        /**
         * Gets the overwrite from the corresponding entity when the model is
         * inside of an entity and get the overwrite of the lesson else.
         *
         * @param {BaseModel} model
         * @param {"activated" | "amount" | "points" | "object"} property
         * @returns {boolean | number | string | null}
         * @memberof Lesson
         */
        getOverwrite(model, property) {
            const ownOverwrite = () => {
                if (!(model._id in this.overwrites) || !isValue(this.overwrites[model._id])) return null;
                return this.overwrites[model._id][property] ?? null;
            };

            const entity = this.getEntity(model);
            if (entity) {
                if (property === "activated") {
                    if (entity.actionObjects.includes(model)) return entity.getOverwrite(model, property);
                    return ownOverwrite();
                }
                return entity.getOverwrite(model, property) ?? ownOverwrite();
            }

            return ownOverwrite();
        }

        /**
         * Sets the overwrite on the corresponding entity when the model is
         * inside of an entity and sets the overwrite on the lesson else.
         *
         * @param {BaseModel} model
         * @param {"activated" | "amount" | "points" | "object"} property
         * @param {boolean | number | string} value
         * @returns {boolean | number | string | null}
         * @memberof Lesson
         */
        setOverwrite(model, property, value) {
            const ownOverwrite = () => {
                if (!this.overwrites[model._id] && !isValue(this.overwrites[model._id])) this.overwrites[model._id] = {};
                this.overwrites[model._id][property] = value;
                return value;
            };

            const entity = this.getEntity(model);
            if (entity) {
                if (property === "activated") {
                    if (entity.actionObjects.includes(model)) return entity.setOverwrite(model, property, value);
                    return ownOverwrite();
                }
                return entity.setOverwrite(model, property, value) ?? ownOverwrite();
            }

            return ownOverwrite();
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
