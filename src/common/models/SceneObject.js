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
                default: `SceneObject`
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
            subObjects: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "SceneObject", autopopulate: true }
                ],
                default: []
            }
        };

        getAvatar() {
            if (this.mime && this.mime.startsWith("image")) {
                return { type: "image", name: `/files/${this._id}` };
            } else return { type: "component", name: "file-document-icon" };
        }
    }
    return SceneObject;
}
