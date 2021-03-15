import { Schema } from "mongoose";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Lesson & T}
 */
export function LessonMixinClass(MixinClass) {
    class Lesson extends MixinClass {

        static className = "Lesson";
        static collection = "lessons";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `Lesson`
            },
            description: {
                type: String,
                default: ""
            },
            inventory: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "SceneObject", autopopulate: true }
                ],
                required: true,
                default: []
            },
            scenes: {
                type: [
                    { type: Schema.Types.ObjectId, ref: "Scene", autopopulate: true }
                ],
                required: true,
                default: []
            }
        };

        getSubObjects() {
            return [...this.scenes, ...this.inventory];
        }
    }
    return Lesson;
}
