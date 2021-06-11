import { Schema } from "mongoose";
import { compact, flatten, uniq } from "~common/utils";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {GameSession & T}
 */
export function GameSessionMixinClass(MixinClass) {
    class GameSession extends MixinClass {

        static className = "GameSession";
        static dataCollectionName = "gameSessions";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                required: false
            },
            lesson: {
                type: Schema.Types.ObjectId,
                ref: "Lesson",
                autopopulate: true,
                reverseDependant: true,
                ignoreOnIteration: true,
                ignoreOnValidation: true
            },
            entities: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Entity", autopopulate: true }
                ],
                required: true,
                default: [],
                dependant: true
            },
            currentScene: {
                type: Schema.Types.ObjectId,
                ref: "Scene",
                autopopulate: true,
                ignoreOnIteration: true,
                ignoreOnValidation: true
            },
            grabbing: {
                type: [{ type: Schema.Types.ObjectId, ref: "Item", autopopulate: true }],
                default: [],
                dependant: true
            },
            inventory: {
                type: [{ type: Schema.Types.ObjectId, ref: "Item", autopopulate: true }],
                default: [],
                dependant: true
            },
            knowledgeBase: {
                type: [{ type: Schema.Types.ObjectId, ref: "Knowledge", autopopulate: true }],
                required: true,
                default: []
            },
            protocol: {
                type: [{ type: Schema.Types.Mixed }],
                required: true,
                default: []
            },
            overwrites: {
                type: Schema.Types.Mixed,
                required: true,
                default: {}
            }
        };

        getAvatar() {
            return this.lesson.getAvatar();
        }

        getEntity(model) {
            return this.lesson.getEntity.call(this, model);
        }

        getOverwrite(model, property) {
            return this.lesson.getOverwrite.call(this, model, property);
        }

        setOverwrite(model, property, value) {
            return this.lesson.setOverwrite.call(this, model, property, value);
        }

        getSubObjects(real) {
            const subObjects = [this.lesson, this.currentScene, ...this.knowledgeBase];
            const items = [...this.grabbing, ...this.inventory];
            if (real) {
                subObjects.push(...items);
            } else subObjects.push(...compact(items.map((item) => item.object)));
            return subObjects;
        }

        getResources() {
            const grabbing = this.grabbing.map((item) => item.object);
            const labels = flatten(grabbing.map((model) => model.getLabels()));
            return uniq([
                ...this.currentScene.getResources(),
                ...grabbing,
                ...labels,
                ...this.knowledgeBase
            ]);
        }

    }
    return GameSession;
}
