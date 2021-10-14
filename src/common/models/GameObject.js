import { Schema } from "mongoose";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {GameObject & T}
 */
export function GameObjectMixinClass(MixinClass) {
    class GameObject extends MixinClass {

        static className = "GameObject";
        static dataCollectionName = "gameObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `GameObject`
            },
            position: {
                type: [Number],
                required: true,
                default: null, // Has to be null to be able to determine if there was a position assigned
                ignoreOnIteration: true
            },
            layer: {
                type: Number,
                required: true,
                default: 0
            },
            labels: {
                type: [{ type: Schema.Types.ObjectId, ref: "Label", autopopulate: true }],
                sticky: true,
                required: true,
                default: [],
                ignoreOnIteration: true
            }
        };
    }
    return GameObject;
}
