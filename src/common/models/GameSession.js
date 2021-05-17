import { Schema } from "mongoose";

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
                reverseDependant: true
            },
            currentScene: {
                type: Schema.Types.ObjectId,
                ref: "Scene",
                autopopulate: true
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
                type: [{ type: String }],
                required: true,
                default: []
            },
            protocol: {
                type: [{ type: Schema.Types.Mixed }],
                required: true,
                default: []
            }
        };

        getAvatar() {
            return this.lesson.getAvatar();
        }

    }
    return GameSession;
}
