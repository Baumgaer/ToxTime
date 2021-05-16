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
        static collection = "knowledge";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `Knowledge`,
                unique: true
            },
            "description_de-de": {
                type: String,
                required: true
            },
            "description_en-us": {
                type: String,
                required: true
            }
        };

    }
    return Knowledge;
}
