/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {SceneObject & T}
 */
export function SceneObjectMixinClass(MixinClass) {
    class SceneObject extends MixinClass {

        static className = "SceneObject";
        static collection = "sceneObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `SceneObject`
            }
        };
    }
    return SceneObject;
}
