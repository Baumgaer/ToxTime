import { Schema } from "mongoose";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {SceneObject & T}
 */
export function SceneObjectMixinClass(MixinClass) {
    class SceneObject extends MixinClass {

        static className = "SceneObject";
        static collection = "sceneObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                unique: true
            },
            creator: {
                required: true
            },
            file: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "File"
            },
            clickAreas: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "ClickArea" }
                ]
            }
        };

        getName(preferredField) {
            return `${this[preferredField] || this.name}`;
        }

        getAvatar() {
            if (this.mime && this.mime.startsWith("image")) {
                return { type: "image", name: `/files/${this._id}` };
            } else return { type: "component", name: "file-document-icon" };
        }
    }
    return SceneObject;
}
