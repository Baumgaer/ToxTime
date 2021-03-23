import { LabelMixinClass } from "~common/models/Label";
import ClientModel from "~client/lib/ClientModel";
import ApiClient from "~client/lib/ApiClient";

const CommonClientLabel = LabelMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Label extends CommonClientLabel {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('label')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    @CommonClientLabel.action("delete", { type: "component", name: "delete-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async delete() {
        if (!this._id) return this.destroy();
        const result = await ApiClient.delete(`/labels/${this._id}`);

        // We do not want to delete sub objects in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        if (result.deleted) return result;

        ApiClient.store.removeModel(this);
    }

    @CommonClientLabel.action("restore", { type: "component", name: "delete-restore-icon" }, (instance) => window.activeUser.isAdmin && instance.deleted)
    async restore() {
        const result = await ApiClient.patch(`/labels/restore/${this._id}`);

        // We do not want to delete sub objects in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        ApiClient.store._trash?.__ob__?.dep.notify();
    }

});
