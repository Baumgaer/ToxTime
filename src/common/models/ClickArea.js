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
                default: `ClickArea`
            },
            shape: {
                type: [
                    [Number]
                ],
                required: true,
                ignoreOnIteration: true,
                default: []
            }
        };

        getLabels() {
            return this.labels;
        }
    }
    return ClickArea;
}
