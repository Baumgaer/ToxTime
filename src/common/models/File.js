import { Schema } from "mongoose";

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
        static collection = "files";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                type: String,
                required: true
            },
            fileName: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true
            },
            mime: {
                type: String,
                required: true
            },
            labels: {
                type: [{ type: Schema.Types.ObjectId, ref: "Label" }],
                sticky: true,
                required: true,
                default: [],
                autopopulate: true
            }
        };

        getName(preferredField) {
            return `${this[preferredField] || this.name}`;
        }

        getLabels() {
            return this.labels;
        }
    }
    return File;
}
