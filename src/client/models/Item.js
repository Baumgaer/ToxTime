import { ItemMixinClass } from "~common/models/Item";
import ClientModel from "~client/lib/ClientModel";
import ApiClient from "~client/lib/ApiClient";

const CommonClientItem = ItemMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Item extends CommonClientItem {

    _cachedResources = {};

    getAvatar() {
        if (!this.object) return { type: "image", name: "" };
        if (!this.object.file) return this.object.sceneObject.file.getAvatar();
        return this.object.file.getAvatar();
    }

    getName() {
        if (!this.object) return "";
        return this.object.getName();
    }

    get object() {
        return this.actionObject || this.sceneObject;
    }

    set object(value) {
        const that = ApiClient.store.getModelById(this.dataCollectionName, this._dummyId || this._id) || this;
        if (!value) {
            that.sceneObject = null;
            that.actionObject = null;
            return;
        }

        if (value.className === "SceneObject") {
            that.sceneObject = value;
            if (this.actionObject) that.actionObject = null;
        }

        if (value.className === "ActionObject") {
            that.actionObject = value;
            if (this.sceneObject) that.sceneObject = null;
        }
    }

});
