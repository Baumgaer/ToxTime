import BaseModel, { mongooseBaseModels } from "~common/lib/BaseModel";
import mongoose from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { get, flatten } from "~common/utils";

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
        const protoModel = Object.getPrototypeOf(Object.getPrototypeOf(RawClass));
        const protoClassName = protoModel.className;
        const protoCollection = protoModel.collection;
        if (mongooseBaseModels[protoClassName] && protoCollection === RawClass.collection) {
            Model = mongooseBaseModels[protoClassName].discriminator(RawClass.className, schema);
        } else Model = mongoose.model(RawClass.className, schema);
        mongooseBaseModels[RawClass.className] = Model;
        Model.className = RawClass.className;
        return { RawClass, Schema: schema, Model, isServerModel: true };
    }

    async getStickyReferencingModels() {
        const referencingModels = [];
        const referencingModelExports = this.getReferencingModelExports();
        for (const referencingModelExport of referencingModelExports) {
            const referencePaths = referencingModelExport.RawClass.getReferencePathsOf(this._getClassName());
            for (const referencePath of referencePaths) {
                const pathValue = get(referencingModelExport.Schema.obj, referencePath);
                if (!pathValue.sticky) continue;
                referencingModels.push(referencingModelExport.Model.find({ [referencePath.join(".")]: this }).exec());
            }
        }

        return flatten((await Promise.all(referencingModels)));
    }
}
