import { Schema } from "mongoose";
import { escape, unescape } from "~common/utils";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {File & T}
 */
export function FileMixinClass(MixinClass) {
    class File extends MixinClass {

        static className = "File";
        static dataCollectionName = "files";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                type: String,
                required: true
            },
            fileName: {
                type: String,
                required: true,
                set: escape
            },
            size: {
                type: Number,
                required: true,
                default: null
            },
            mime: {
                type: String,
                required: true,
                set: escape,
                default: null
            },
            labels: {
                type: [{ type: Schema.Types.ObjectId, ref: "Label", autopopulate: true }],
                sticky: true,
                required: true,
                default: [],
                ignoreOnIteration: true
            }
        };

        getName(preferredField) {
            return unescape(`${this[preferredField] || this.name}`);
        }

        getLabels() {
            return this.labels;
        }

        canOverwriteAmount() {
            return false;
        }

        canOverwriteObject() {
            return false;
        }
    }
    return File;
}
