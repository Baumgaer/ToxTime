import { RequisiteMixinClass } from "~common/models/Requisite";
import GameObject from "~client/models/GameObject";
import ApiClient from "~client/lib/ApiClient";

const CommonGameObjectRequisite = RequisiteMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class Requisite extends CommonGameObjectRequisite {

    getAvatar() {
        return {
            type: "image",
            name: `/requisites/${this._id}/avatar`,
            title: window.$t("requisite")
        };
    }

    @CommonGameObjectRequisite.action("delete", { type: "component", name: "delete-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async delete() {
        if (!this._id) {
            this.destroy();
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
            return;
        }
        const result = await ApiClient.delete(`/${this.collection}/${this._id}`);

        // We do not want to delete sub objects in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        if (result.deleted) return result;

        ApiClient.store.removeModel(this);

        for (const clickArea of this.clickAreas) {
            ApiClient.store.removeModel(clickArea);
        }

        for (const actionObject of this.actionObjects) {
            ApiClient.store.removeModel(actionObject);
        }
    }

    @CommonGameObjectRequisite.action("restore", { type: "component", name: "delete-restore-icon" }, (instance) => window.activeUser.isAdmin && instance.deleted)
    async restore() {
        const result = await ApiClient.delete(`/${this.collection}/restore/${this._id}`);

        // We do not want to delete sub objects in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        ApiClient.store._trash?.__ob__?.dep.notify();
    }

    @CommonGameObjectRequisite.action("copy", { type: "component", name: "content-copy-icon" }, () => window.activeUser.isAdmin)
    copy() {
        ApiClient.post(`/${this.collection}/copy/${this._id}`, {
            name: `${window.$t("copyOf")} ${this.getName()}`
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
