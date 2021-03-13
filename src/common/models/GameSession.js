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
        static collection = "gameSessions";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                required: false
            },
            lesson: {
                type: Schema.Types.ObjectId,
                ref: "Lesson",
                autopopulate: true
            },
            currentScene: {
                type: Schema.Types.ObjectId,
                ref: "Scene",
                autopopulate: true
            },
            grabbing: {
                type: [{ type: Schema.Types.ObjectId, ref: "Item", autopopulate: true }],
                default: [],
                normalizeItems: true
            },
            inventory: {
                type: [{ type: Schema.Types.ObjectId, ref: "Item", autopopulate: true }],
                default: [],
                normalizeItems: true
            },
            knowledgeBase: {
                type: [{ type: String }],
                default: []
            },
            protocol: {
                type: [{ type: Schema.Types.Mixed }],
                default: []
            }
        };

        getAvatar() {
            return this.lesson.getAvatar();
        }

    }
    return GameSession;
}
