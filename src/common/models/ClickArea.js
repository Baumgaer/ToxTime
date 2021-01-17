// import { Schema } from "mongoose";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {ClickArea & T}
 */
export function ClickAreaMixinClass(MixinClass) {
    class ClickArea extends MixinClass {

        static className = "ClickArea";
        static collection = "clickAreas";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                unique: true
            },
            creator: {
                required: true
            },
            shape: {
                type: String,
                required: true
            }
        };

        getName(preferredField) {
            return `${this[preferredField] || this.name}`;
        }

        getAvatar() {
            return null;
        }
    }
    return ClickArea;
}
