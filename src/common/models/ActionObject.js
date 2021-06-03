import { Schema } from "mongoose";
import { uniq } from "~common/utils";
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
        static dataCollectionName = "actionObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
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
                required: true,
                autopopulate: true,
                sticky: true
            }
        };

        getSubObjects(real) {
            if (real || this.sceneObject?.deleted) return [this.sceneObject];
            return this.sceneObject.getSubObjects();
        }

        getLabels() {
            return uniq(this.labels.concat(this.sceneObject.getLabels()));
        }
    }
    return ActionObject;
}
