import { escape } from "~common/utils";
import NatSort from "natsort";

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

        getOverwritableFields(lesson, forbiddenVarNames = []) {
            const fields = [];
            const regex = /\{\{\s(.*?)(?:\((?:(.*),?)*\))?\s\}\}/ig;
            const languages = ["de-de", "en-us"];

            for (const language of languages) {
                const description = unescape(this[`description_${language}`]);
                const matches = description.match(regex);
                if (!matches) continue;
                for (const match of matches) {
                    const varName = match.slice(2, -2).trim();
                    if (varName.includes("(") || varName.includes(")") || forbiddenVarNames.includes(varName)) continue;
                    const name = `${varName}_${language}`;
                    if (fields.find((field) => field.name === name)) continue;
                    const overwriteValue = lesson && lesson.getOverwrite(this, name);
                    fields.push({ name, type: "text", value: overwriteValue ?? "", disabled: false });
                }
            }
            return fields.sort((a, b) => NatSort()(a.name, b.name));
        }

    }
    return MultiLingualDescribed;
}
