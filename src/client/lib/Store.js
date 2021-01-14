import onChange from "on-change";
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
                model = onChange(new modelMap[modelLike.className](modelLike), function (path, value, prevValue) {
                    console.log(path, value, prevValue);
                }, { pathAsArray: true, ignoreUnderscores: true });
            }
            if (!(model instanceof Error)) this.collection(collectionName)[id] = model;
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
    }
}
