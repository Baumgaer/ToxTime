import { Schema } from "mongoose";
import { escape } from "~common/utils";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {SpeechBubble & T}
 */
export function SpeechBubbleMixinClass(MixinClass) {
    class SpeechBubble extends MixinClass {

        static className = "SpeechBubble";
        static dataCollectionName = "speechBubbles";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `SpeechBubble`,
                unique: true
            },
            recipe: {
                type: Schema.Types.ObjectId,
                ref: "Recipe",
                required: false,
                default: null
            },
            "error_de-de": {
                type: String,
                required: false,
                default: null,
                set: escape
            },
            "error_en-us": {
                type: String,
                required: false,
                default: null,
                set: escape
            }
        };

    }
    return SpeechBubble;
}
