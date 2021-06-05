import { Schema } from "mongoose";
import { uniq, flatten } from "~common/utils";
/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Entity & T}
 */
export function EntityMixinClass(MixinClass) {
    class Entity extends MixinClass {

        static className = "Entity";
        static dataCollectionName = "entities";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `Entity`
            },
            actionObjects: {
                type: [{ type: Schema.Types.ObjectId, ref: "ActionObject", autopopulate: true }],
                default: [],
                sticky: true
            },
            sceneObjects: {
                type: [{ type: Schema.Types.ObjectId, ref: "SceneObject", autopopulate: true }],
                default: [],
                sticky: true
            }
        };

        getSubObjects() {
            return this.actionObjects.concat(this.sceneObjects);
        }

        getLabels() {
            const actionObjectLabels = flatten(this.actionObjects.map((actionObject) => actionObject.getLabels()));
            const sceneObjectLabels = flatten(this.sceneObjects.map((sceneObject) => sceneObject.getLabels()));
            return uniq([...actionObjectLabels, ...sceneObjectLabels]);
        }
    }
    return Entity;
}
