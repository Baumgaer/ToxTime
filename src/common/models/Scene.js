/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Scene & T}
 */
export function SceneMixinClass(MixinClass) {
    class Scene extends MixinClass {

        static className = "Scene";
        static collection = "scenes";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `Scene`
            }
        };
    }
    return Scene;
}