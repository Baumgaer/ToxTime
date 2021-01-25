import BaseModel, { mongooseBaseModels } from "~common/lib/BaseModel";
import mongoose from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

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
        const schema = this.buildSchema(RawClass);
        for (const plugin of plugins) schema.plugin(...plugin);
        schema.plugin(mongooseAutoPopulate);
        let Model;
        const protoClassName = Object.getPrototypeOf(Object.getPrototypeOf(RawClass)).className;
        if (mongooseBaseModels[protoClassName]) {
            Model = mongooseBaseModels[protoClassName].discriminator(RawClass.className, schema);
        } else Model = mongoose.model(RawClass.className, schema);
        mongooseBaseModels[RawClass.className] = Model;
        Model.className = RawClass.className;
        return { RawClass, Schema: schema, Model, isServerModel: true };
    }
}
