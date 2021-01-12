import BaseModel from "~common/lib/BaseModel";
import { dataTransformer } from "~common/utils";
import { Schema } from "mongoose";
import { } from "vue";

const stagedChangesKey = "stagedChanges";
export default class ClientModel extends BaseModel {

    static className = "ClientModel";

    static collection = "clientModels";

    /**
     * Builds the essential export for client side with a RawClass, a Schema and the Model
     *
     * @static
     * @template T
     * @param {T} RawClass "The Class" which describes the Model
     * @memberof ClientModel
     * @returns { {RawClass: T, Schema: import("mongoose").Schema<T>, Model: T} }
     */
    static buildClientExport(RawClass) {
        const schema = new Schema(RawClass.schema, {
            collection: RawClass.collection,
            toObject: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) },
            toJSON: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) }
        });
        schema.loadClass(RawClass);
        const cloneClass = class CloneClass extends RawClass { };
        for (const key in RawClass.schema) {
            if (Object.hasOwnProperty.call(RawClass.schema, key)) {
                console.log(`define property ${key} overwrite ${Object.getOwnPropertyDescriptor(cloneClass, key)}`);
                const fieldDefinition = RawClass.schema[key];
                Object.defineProperty(cloneClass, key, {
                    get: function () {
                        const value = this[`__${key}__`];
                        return fieldDefinition.default && value === undefined ? fieldDefinition.default : value;
                    },
                    set: function (value) {
                        this[`__${key}__`] = value;
                        if (!Reflect.hasMetadata(stagedChangesKey, this)) Reflect.defineMetadata(stagedChangesKey, {}, this);
                        const stagedChanges = Reflect.getMetadata(stagedChangesKey, this);
                        stagedChanges[key] = value;
                        if (this.__ob__) this.__ob__.dep.notify();
                    }
                });
            }
        }
        return { RawClass, Schema: schema, Model: cloneClass, isClientModel: true };
    }

    save() {
        if (!Reflect.hasMetadata(stagedChangesKey, this)) Reflect.defineMetadata(stagedChangesKey, {}, this);
        const stagedChanges = Reflect.getMetadata(stagedChangesKey, this);
        console.log(stagedChanges);
    }
}
