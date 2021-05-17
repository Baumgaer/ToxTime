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
            },
            "description_de-de": {
                type: String,
                required: true,
                default: null
            },
            "description_en-us": {
                type: String,
                required: true,
                default: null
            }
        };

    }
    return Knowledge;
}
