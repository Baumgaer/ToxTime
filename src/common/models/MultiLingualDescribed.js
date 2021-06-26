import { escape } from "~common/utils";
/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {MultiLingualDescribed & T}
 */
export function MultiLingualDescribedMixinClass(MixinClass) {
    class MultiLingualDescribed extends MixinClass {

        static className = "MultiLingualDescribed";
        static dataCollectionName = "multiLingualDescribed";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `MultiLingualDescribed`,
                unique: true
            },
            "description_de-de": {
                type: String,
                required: true,
                default: null,
                set: escape
            },
            "description_en-us": {
                type: String,
                required: true,
                default: null,
                set: escape
            }
        };

    }
    return MultiLingualDescribed;
}
