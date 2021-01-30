import { Schema } from "mongoose";
/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {ActionObject & T}
 */
export function ActionObjectMixinClass(MixinClass) {
    class ActionObject extends MixinClass {

        static className = "ActionObject";
        static collection = "actionObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `ActionObject`
            },
            rotation: {
                type: Number,
                required: true,
                default: 0
            },
            scale: {
                type: Number,
                required: true,
                default: 1
            },
            sceneObject: {
                type: Schema.Types.ObjectId,
                ref: "SceneObject",
                required: true
            }
        };
    }
    return ActionObject;
}
