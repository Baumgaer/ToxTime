import { UserMixinClass } from "~common/models/User";
import ApiClient from "~client/lib/ApiClient";
import ClientModel from "~client/lib/ClientModel";

const CommonClientUser = UserMixinClass(ClientModel);
export default ClientModel.buildClientExport(class User extends CommonClientUser {

    /** @type {"addUsers" | "editUser" | "scene" | "sceneObject" | null} */
    activeEditor = null;

    /** @type {ClientModel | null} */
    editingModel = null;

    @CommonClientUser.action("delete", { type: "component", name: "delete-icon" }, (instance) => instance !== window.activeUser)
    async delete() {
        const result = await ApiClient.delete(`/users/${this._id}`);
        if ((result instanceof Error)) return result;
        ApiClient.store.removeModel(this);
    }

    @CommonClientUser.action("resentConfirm", { type: "component", name: "email-check-icon" }, (instance) => !instance.isConfirmed)
    async resentConfirm() {
        const result = await ApiClient.patch(`/users/resentConfirm/${this._id}`);
        if ((result instanceof Error)) return result;
        return true;
    }

    @CommonClientUser.action("lock", { type: "component", name: "lock-icon" }, (instance) => instance.isActive && instance !== window.activeUser && window.activeUser.isAdmin)
    @CommonClientUser.action("unlock", { type: "component", name: "lock-open-icon" }, (instance) => !instance.isActive && instance !== window.activeUser && window.activeUser.isAdmin)
    async toggleLock() {
        const result = await ApiClient.patch(`/users/toggleLock/${this._id}`);
        if ((result instanceof Error)) return result;
        return true;
    }

    @CommonClientUser.action("logout", { type: "component", name: "logout-icon" }, (instance) => window.activeUser.isAdmin || instance === window.activeUser)
    async kick() {
        if (this === window.activeUser) {
            location.href = "/logout";
            return true;
        }
        const result = await ApiClient.get(`/logout/${this._id}`);
        if ((result instanceof Error)) return result;
        return true;
    }

    @CommonClientUser.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin || instance === window.activeUser)
    async edit() {
        // Empty...
    }
});
