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
                type: [{
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                    autopopulate: true
                }],
                default: []
            },
            inventory: {
                type: [{
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                    autopopulate: true
                }],
                default: []
            },
            knowledgeBase: {
                type: [{
                    type: Schema.Types.ObjectId,
                    ref: "Knowledge",
                    autopopulate: true
                }],
                default: []
            }
        };

    }
    return GameSession;
}
