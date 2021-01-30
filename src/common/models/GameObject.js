/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {GameObject & T}
 */
export function GameObjectMixinClass(MixinClass) {
    class GameObject extends MixinClass {

        static className = "GameObject";
        static collection = "gameObjects";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                default: `GameObject`
            },
            position: {
                type: [Number],
                required: true
            }
        };
    }
    return GameObject;
}
