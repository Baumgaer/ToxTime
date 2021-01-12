import BaseModel from "~common/lib/BaseModel";
import { dataTransformer } from "~common/utils";
import { Schema } from "mongoose";

export default class ClientModel extends BaseModel {

    static className = "ClientModel";

    static collection = "clientModels";

    static buildClientExport(RawClass) {
        const schema = new Schema(RawClass.schema, {
            collection: RawClass.collection,
            toObject: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) },
            toJSON: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) }
        });
        schema.loadClass(RawClass);
        return { RawClass, Schema: schema, Model: RawClass };
    }
}
