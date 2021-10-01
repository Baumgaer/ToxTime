import { Schema } from "mongoose";
import { uniq } from "~common/utils";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Requisite & T}
 */
export function RequisiteMixinClass(MixinClass) {
    class Requisite extends MixinClass {

        static className = "Requisite";
        static dataCollectionName = "requisites";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `Requisite`
            },
            file: {
                type: Schema.Types.ObjectId,
                default: null,
                sticky: true,
                ref: "File",
                ignoreOnIteration: true,
                autopopulate: true,
                validate: {
                    validator: (value) => {
                        return Boolean(value);
                    },
                    name: "background",
                    type: "required"
                }
            },
            clickAreas: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "ClickArea", autopopulate: true }
                ],
                default: [],
                dependant: true,
                sticky: true
            },
            actionObjects: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "ActionObject", autopopulate: true }
                ],
                default: [],
                dependant: true,
                sticky: true
            }
        };

        getSubObjects() {
            return this.clickAreas.concat(this.actionObjects);
        }

        getLabels() {
            let labels = this.labels;
            if (this.file) labels = labels.concat(this.file.getLabels());
            return uniq(labels);
        }
    }
    return Requisite;
}
