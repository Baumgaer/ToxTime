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
                default: null,
                sticky: true,
                autopopulate: true,
                ignoreOnIteration: true
            },
            exitRecipe: {
                type: Schema.Types.ObjectId,
                ref: "Recipe",
                required: false,
                default: null,
                sticky: true,
                autopopulate: true,
                ignoreOnIteration: true
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

        getSubObjects() {
            if (!this.recipe) return [];
            return [this.recipe];
        }

        canOverwriteAmount() {
            return false;
        }

        canOverwriteObject() {
            return false;
        }

    }
    return SpeechBubble;
}
