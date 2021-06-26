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
            }
        };

    }
    return SpeechBubble;
}
