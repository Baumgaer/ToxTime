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
            uploadDate: {
                type: Date,
                required: true,
                default: new Date()
            },
            uploader: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User"
            }
        };

        getName(preferredField) {
            return `${this[preferredField] || this.name}`;
        }

        getAvatar() {
            return {
                type: "image",
                name: `/files/${this._id}`
            };
        }
    }
    return File;
}
