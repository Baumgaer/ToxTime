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
        static collection = "gameObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `GameObject`
            },
            position: {
                type: [Number],
                required: true
            },
            layer: {
                type: Number,
                required: true,
                default: 0
            },
            labels: {
                type: [{ type: Schema.Types.ObjectId, ref: "Label" }],
                sticky: true,
                required: true,
                default: [],
                autopopulate: true
            }
        };
    }
    return GameObject;
}
