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
                validate: {
                    validator: function (value) {
                        const valueToCheck = this.originalModel?.scenes || value;
                        return valueToCheck && valueToCheck.length > 0;
                    },
                    name: "notEnoughScenes",
                    type: "required"
                },
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
            punishClicks: {
                type: Number,
                min: 0,
                required: true,
                default: 0
            },
            punishSeconds: {
                type: Number,
                min: 0,
                required: true,
                default: 0
            },
            punishPoints: {
                type: Number,
                min: 0,
                required: true,
                default: 0
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
                validate: {
                    validator: (value) => {
                        return value && value.length > 0;
                    },
                    name: "notEnoughGoals",
                    type: "required"
                },
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
                return this.overwrites[model._id]?.[property] ?? null;
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

        /**
         * Returns the ordinary sum, the positive sum or the negative sum
         * depending on mode.
         *
         * @param {"sum" | "positive" | "negative"} [mode="sum"]
         * @returns {number}
         * @memberof Lesson
         */
        getRecipePoints(mode = "positive") {
            return this.getRecipes(true).reduce((total, recipe) => {
                const points = Number(this.getOverwrite(recipe, "points") || 0);
                if (mode === "sum") {
                    return total + points;
                } else if (mode === "positive" && points > 0) {
                    return total + points;
                } else if (mode === "negative" && points < 0) return total + points;
                return total;
            }, 0);
        }

        /**
         * Returns the minimum or the maximum points of the goals
         *
         * @param {"max" | "min"} [mode="max"]
         * @returns {number}
         * @memberof Lesson
         */
        getGoalPoints(mode = "max") {
            return Math[mode](0, ...this.goals.map((goal) => goal.points));
        }

        getTotalPoints() {
            return this.getRecipePoints() + this.getGoalPoints();
        }
    }
    return Lesson;
}
