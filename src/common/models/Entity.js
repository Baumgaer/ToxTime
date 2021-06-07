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
            labels: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Label", autopopulate: true }
                ],
                default: [],
                sticky: true
            },
            actionObjects: {
                type: [{ type: Schema.Types.ObjectId, ref: "ActionObject", autopopulate: true }],
                default: [],
                sticky: true,
                ignoreOnIteration: true
            },
            clickAreas: {
                type: [{ type: Schema.Types.ObjectId, ref: "ClickArea", autopopulate: true }],
                default: [],
                sticky: true,
                ignoreOnIteration: true
            }
        };

        getSubObjects() {
            return this.actionObjects.concat(this.clickAreas);
        }

        getLabels() {
            const labels = flatten(this.actionObjects.map((actionObject) => actionObject.getLabels()));
            return uniq(labels);
        }
    }
    return Entity;
}
