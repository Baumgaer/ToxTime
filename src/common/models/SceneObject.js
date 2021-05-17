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
        static dataCollectionName = "sceneObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `SceneObject`
            }
        };
    }
    return SceneObject;
}
