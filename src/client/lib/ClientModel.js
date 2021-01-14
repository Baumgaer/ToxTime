import BaseModel from "~common/lib/BaseModel";
import { dataTransformer } from "~common/utils";
import { Schema } from "mongoose";
import onChange from "on-change";
import ApiClient from "~client/lib/ApiClient";

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
        const modelClass = class ModelClass extends RawClass {
            constructor(params) {
                super();
                Object.assign(this, params);
            }
        };
        return { RawClass, Schema: schema, Model: modelClass, isClientModel: true };
    }

    save() {
        const that = onChange.target(this);
        if (!Reflect.hasMetadata("stagedChanges", that)) Reflect.defineMetadata("stagedChanges", {}, that);
        const stagedChanges = Reflect.getMetadata("stagedChanges", that);
        let method = ApiClient.post;
        if (!that._id && that.__dummyId) method = ApiClient.patch;
        const data = {};
        for (const key in stagedChanges) {
            if (Object.hasOwnProperty.call(that, key)) {
                const value = that[key];
                data[key] = value;
            }
        }
        method(`/users/${that._id || that.__dummyId}`, data);
    }
}
