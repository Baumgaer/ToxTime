import { Schema } from "mongoose";

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
        static collection = "requisites";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `Requisite`
            },
            file: {
                type: Schema.Types.ObjectId,
                required: true,
                sticky: true,
                ref: "File",
                autopopulate: true
            },
            clickAreas: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "ClickArea", autopopulate: true }
                ],
                default: [],
                dependant: true
            },
            actionObjects: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "ActionObject", autopopulate: true }
                ],
                default: [],
                dependant: true
            }
        };

        getSubObjects() {
            return this.clickAreas.concat(this.actionObjects);
        }

        getLabels() {
            let labels = this.labels.concat(this.file.getLabels());
            for (const subObject of this.getSubObjects()) {
                labels = labels.concat(subObject.getLabels());
            }
            return labels;
        }
    }
    return Requisite;
}
