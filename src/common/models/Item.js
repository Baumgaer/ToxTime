import { Schema } from "mongoose";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Item & T}
 */
export function ItemMixinClass(MixinClass) {
    class Item extends MixinClass {

        static className = "Item";
        static collection = "items";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            name: {
                required: false
            },
            amount: {
                type: Number,
                required: true,
                default: 1
            },
            sceneObject: {
                type: Schema.Types.ObjectId,
                ref: "SceneObject",
                autopopulate: true,
                required: false,
                default: null
            },
            actionObject: {
                type: Schema.Types.ObjectId,
                ref: "ActionObject",
                autopopulate: true,
                required: false,
                default: null
            }
        };

        get object() {
            return this.actionObject || this.sceneObject;
        }

    }
    return Item;
}
