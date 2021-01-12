import BaseModel from "~common/lib/BaseModel";
import { Schema, connection } from "mongoose";
import { dataTransformer } from "~common/utils";

export default class ServerModel extends BaseModel {

    static className = "ServerModel";

    static collection = "serverModels";

    /**
     * Builds the essential export for server side with a RawClass, a Schema and the Model
     *
     * @static
     * @template T
     * @param {T} RawClass "The Class" which describes the Model
     * @param {any[][]} [plugins=[]]
     * @memberof ServerModel
     * @returns { {RawClass: T, Schema: import("mongoose").Schema<T>, Model: import("mongoose").Model} }
     */
    static buildServerExport(RawClass, plugins = []) {
        const schemaDeclaration = {};
        const prototypeSchemas = [RawClass.schema || {}];
        let proto = Object.getPrototypeOf(RawClass);
        while (proto) {
            prototypeSchemas.unshift(proto.schema || {});
            proto = Object.getPrototypeOf(proto);
        }
        for (const prototypeSchema of prototypeSchemas) Object.assign(schemaDeclaration, prototypeSchema);
        const schema = new Schema(schemaDeclaration, {
            collection: RawClass.collection,
            toObject: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) },
            toJSON: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) }
        });
        schema.loadClass(RawClass);
        for (const plugin of plugins) schema.plugin(...plugin);
        const Model = connection.model(RawClass.className, schema);
        Model.className = RawClass.className;
        return { RawClass, Schema: schema, Model, isServerModel: true };
    }
}
