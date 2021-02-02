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
                ref: "File",
                autopopulate: true
            },
            clickAreas: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "ClickArea", autopopulate: true }
                ],
                default: []
            },
            actionObjects: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "ActionObject", autopopulate: true }
                ],
                default: []
            }
        };

        getSubObjects() {
            return this.clickAreas.concat(this.actionObjects);
        }
    }
    return Requisite;
}
