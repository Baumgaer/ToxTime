/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Knowledge & T}
 */
export function KnowledgeMixinClass(MixinClass) {
    class Knowledge extends MixinClass {

        static className = "Knowledge";
        static dataCollectionName = "knowledge";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `Knowledge`,
                unique: true
            }
        };

        canOverwriteAmount() {
            return false;
        }

        canOverwriteObject() {
            return false;
        }

    }
    return Knowledge;
}
