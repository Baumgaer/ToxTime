import { RequisiteMixinClass } from "~common/models/Requisite";
import GameObject from "~client/models/GameObject";
import ApiClient from "~client/lib/ApiClient";

const CommonGameObjectRequisite = RequisiteMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class Requisite extends CommonGameObjectRequisite {

    getAvatar() {
        return {
            type: "image",
            name: `/requisites/${this._id}/avatar?v=${this.getModifyHash()}`,
            title: window.$t("requisite")
        };
    }

    @CommonGameObjectRequisite.action("delete", { type: "component", name: "delete-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted, true)
    async delete() {
        const result = await super.delete();
        if (result) return result;

        for (const clickArea of this.clickAreas) {
            ApiClient.store.removeModel(clickArea);
        }

        for (const actionObject of this.actionObjects) {
            ApiClient.store.removeModel(actionObject);
        }
    }

    async save() {
        this.isCreatingAvatar = true;
        const result = await super.save();

        const start = Date.now();
        const timeoutInterval = setInterval(() => {
            if (!this.isCreatingAvatar) clearInterval(timeoutInterval);
            if ((Date.now() - start) >= 8000) {
                this.isCreatingAvatar = false;
                clearInterval(timeoutInterval);
            }
        });

        return result;
    }

});
