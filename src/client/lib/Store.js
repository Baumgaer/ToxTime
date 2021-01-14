import onChange from "on-change";
import lodash from "lodash";
import User from "~client/models/User";

export const modelMap = {
    Error,
    User: User.Model
};

/**
 * @typedef {import("~common/lib/BaseModel").default} Model
 * @typedef {Partial<Model>} ModelLike
 */
export class Store {

    static instance = null;

    collections = {};

    constructor() {
        if (!Store.usedInstanceGetter) throw new Error("This is a singleton, use Store.getInstance()!");
    }

    /**
     *
     *
     * @static
     * @returns {Store}
     * @memberof Store
     */
    static getInstance() {
        Store.usedInstanceGetter = true;
        if (!Store.instance) Store.instance = new Store();
        Store.usedInstanceGetter = false;
        return Store.instance;
    }

    /**
     * Creates a collection if not exists and returns it
     *
     * @param {string} name
     * @returns {Record<string, Model>}
     * @memberof Store
     */
    collection(name) {
        if (!this.collections[name]) this.collections[name] = {};
        return this.collections[name];
    }

    /**
     * Returns a model from collection name with given id if exists and null else
     *
     * @param {string} collectionName
     * @param {string} id
     * @returns {Model | null}
     * @memberof Store
     */
    getModelById(collectionName, id) {
        const collection = this.collection(collectionName);
        const model = collection[id];
        if (!model) return null;
        return model;
    }

    /**
     *
     *
     * @param {ModelLike} modelLike
     * @returns {boolean}
     * @memberof Store
     */
    hasModel(modelLike) {
        return Boolean(this.getModelById(modelLike.collection, modelLike.__dummyId || modelLike._id));
    }

    /**
     * Adds a given model like object as initialized model to the store.
     * The object musst contain at least _id or _dummyId and a collection
     *
     * @param {ModelLike} modelLike
     * @returns {Model}
     * @memberof Store
     */
    addModel(modelLike) {
        const collectionName = modelLike.collection;
        const id = modelLike._dummyId || modelLike._id;
        let model = modelLike;
        if (!this.hasModel(model)) {
            if (!(modelLike instanceof modelMap[modelLike.className])) {
                model = this._installChangeObserver(new modelMap[modelLike.className](modelLike));
            }
            if (!(model instanceof Error)) this.collection(collectionName)[id] = model;
            if (this.collection(collectionName).__ob__) this.collection(collectionName).__ob__.dep.notify();
            return model;
        } else return this.updateModel(model);
    }

    /**
     *
     *
     * @param {ModelLike} modelLike
     * @returns {Model}
     * @memberof Store
     */
    updateModel(modelLike) {
        if (modelLike instanceof modelMap[modelLike.className]) throw new Error("You should not pass an instance here");
        const dummyModel = this.getModelById(modelLike.collection, modelLike.__dummyId);
        let realModel = this.getModelById(modelLike.collection, modelLike._id);
        if (dummyModel) {
            this.removeModel(dummyModel);
            delete dummyModel.__dummyId;
            delete modelLike.__dummyId;
            realModel = this.addModel(dummyModel);
        }
        const collectionName = realModel.collection;
        if (this.collection(collectionName).__ob__) this.collection(collectionName).__ob__.dep.notify();
        return Object.assign(realModel, modelLike);
    }

    /**
     *
     *
     * @param {ModelLike} modelLike
     * @returns {void}
     * @memberof Store
     */
    removeModel(modelLike) {
        delete this.collection(modelLike.collection)[modelLike.__dummyId || modelLike._id];
        const collectionName = modelLike.collection;
        if (this.collection(collectionName).__ob__) this.collection(collectionName).__ob__.dep.notify();
    }

    _installChangeObserver(model) {
        const initializedFields = {};
        return onChange(model, function (path) {
            const fieldName = path[0];
            if (!Object.getPrototypeOf(this).constructor.schema[fieldName]) return;
            if (fieldName in initializedFields) {
                if (!Reflect.hasMetadata("stagedChanges", model)) Reflect.defineMetadata("stagedChanges", {}, model);
                const stagedChanges = Reflect.getMetadata("stagedChanges", model);
                stagedChanges[fieldName] = true;
            } else initializedFields[fieldName] = true;

        }, { pathAsArray: true, ignoreUnderscores: true, equals: lodash.isEqual });
    }
}
