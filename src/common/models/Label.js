/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Label & T}
 */
export function LabelMixinClass(MixinClass) {
    class Label extends MixinClass {

        static className = "Label";
        static collection = "labels";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `Label`,
                unique: true
            }
        };

    }
    return Label;
}
