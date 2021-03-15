import { RequisiteMixinClass } from "~common/models/Requisite";
import GameObject from "~client/models/GameObject";
import ApiClient from "~client/lib/ApiClient";

const CommonGameObjectRequisite = RequisiteMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class Requisite extends CommonGameObjectRequisite {

    getAvatar() {
        return {
            type: "image",
            name: `/requisites/${this._id}/avatar`,
            title: window.vm.$t("requisite")
        };
    }

    @CommonGameObjectRequisite.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
        if (!this._id) {
            this.destroy();
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
            return;
        }
        const result = await ApiClient.delete(`/${this.collection}/${this._id}`);
        if ((result instanceof Error)) return result;
        ApiClient.store.removeModel(this);

        for (const clickArea of this.clickAreas) {
            ApiClient.store.removeModel(clickArea);
        }

        for (const actionObject of this.actionObjects) {
            ApiClient.store.removeModel(actionObject);
        }
    }

    @CommonGameObjectRequisite.action("copy", { type: "component", name: "content-copy-icon" }, () => window.activeUser.isAdmin)
    copy() {
        ApiClient.post(`/${this.collection}/copy/${this._id}`, {
            name: `${window.vm.$t("copyOf")} ${this.getName()}`
        });
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
