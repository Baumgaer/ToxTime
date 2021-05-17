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
        static dataCollectionName = "items";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
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
                reverseDependant: true,
                required: false,
                default: null
            },
            actionObject: {
                type: Schema.Types.ObjectId,
                ref: "ActionObject",
                autopopulate: true,
                reverseDependant: true,
                required: false,
                default: null
            }
        };

        get object() {
            return this.actionObject || this.sceneObject;
        }

        set object(value) {
            if (!value) {
                this.sceneObject = null;
                this.actionObject = null;
                return;
            }

            if (value.className === "SceneObject") {
                this.sceneObject = value;
                if (this.actionObject) this.actionObject = null;
            }

            if (value.className === "ActionObject") {
                this.actionObject = value;
                if (this.sceneObject) this.sceneObject = null;
            }
        }

    }
    return Item;
}
