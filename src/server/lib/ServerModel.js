import BaseModel, { mongooseBaseModels } from "~common/lib/BaseModel";
import mongoose from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { get, flatten, compact } from "~common/utils";

export default class ServerModel extends BaseModel {

    static className = "ServerModel";

    static dataCollectionName = "serverModels";

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
        const protoCollection = protoModel.dataCollectionName;
        if (mongooseBaseModels[protoClassName] && protoCollection === RawClass.dataCollectionName) {
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

    async getStickyReferencingNetwork() {
        let stickyReferencingModels = await this.getStickyReferencingModels();
        const dependantReferencedModels = await this.getDependantReferencedModels();
        for (const dependantReferencedModel of dependantReferencedModels) {
            stickyReferencingModels = stickyReferencingModels.concat(await dependantReferencedModel.getStickyReferencingNetwork());
        }
        return stickyReferencingModels;
    }

    async getStickyReferencedDeletedModels() {
        const referenceModelExports = this.getReferenceModelExports();
        let results = [];

        for (const referenceModelExport of referenceModelExports) {
            for (const referencePath of this.getReferencePathsOf(referenceModelExport.RawClass.className)) {
                // If the reference is not sticky, skip it
                if (!get(this.getSchemaObject(), referencePath)?.sticky) continue;
                if (!this.populated(referencePath.join("."))) {
                    results.push(get(await global._modelMap[this._getClassName()].Model
                        .findById(this._id.toString(), referencePath.join("."))
                        .populate(referencePath.join(" "))
                        .exec(), referencePath)
                    );
                } else results.push(get(this, referencePath));
            }
        }

        results = compact(flatten(results)).filter((result) => result.deleted);

        return results;
    }

    async getDependantReferencingModels() {
        const referencingModels = [];
        const referencingModelExports = this.getReferencingModelExports();
        for (const referencingModelExport of referencingModelExports) {
            const referencePaths = referencingModelExport.RawClass.getReferencePathsOf(this._getClassName());
            for (const referencePath of referencePaths) {
                const pathValue = get(referencingModelExport.Schema.obj, referencePath);
                if (!pathValue.dependant) continue;
                referencingModels.push(referencingModelExport.Model.find({ [referencePath.join(".")]: this }).exec());
            }
        }

        return flatten((await Promise.all(referencingModels)));
    }

    async getDependantReferencedModels() {
        const referenceModelExports = this.getReferenceModelExports();
        const results = [];

        for (const referenceModelExport of referenceModelExports) {
            for (const referencePath of this.getReferencePathsOf(referenceModelExport.RawClass.className)) {
                // If the reference is not sticky, skip it
                if (!get(this.getSchemaObject(), referencePath)?.dependant) continue;
                if (!this.populated(referencePath.join("."))) {
                    results.push(get(await global._modelMap[this._getClassName()].Model
                        .findById(this._id.toString(), referencePath.join("."))
                        .populate(referencePath.join(" "))
                        .exec(), referencePath)
                    );
                } else results.push(get(this, referencePath));
            }
        }

        return flatten(results);
    }
}
