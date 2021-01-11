import CommonUser from "~common/models/User";
import ApiClient from "~client/controllers/ApiClient";

export default class User extends CommonUser {

    @CommonUser.action("delete", { type: "component", name: "delete-icon" }, (instance) => instance !== window.activeUser)
    async delete() {
        const result = await ApiClient.delete(`/users/delete/${this._id}`);
        if (!result.success) return result.error;
        ApiClient.store = { name: "remove", collection: this.collection, key: this._id };
    }

    @CommonUser.action("resentConfirm", { type: "component", name: "email-check-icon" }, (instance) => !instance.isConfirmed)
    async resentConfirm() {
        const result = await ApiClient.patch(`/users/resentConfirm/${this._id}`);
        if (!result.success) return result.error;
        return true;
    }

    @CommonUser.action("lock", { type: "component", name: "lock-icon" }, (instance) => instance.isActive && instance !== window.activeUser)
    @CommonUser.action("unlock", { type: "component", name: "lock-open-icon" }, (instance) => !instance.isActive && instance !== window.activeUser)
    async toggleLock() {
        const result = await ApiClient.patch(`/users/toggleLock/${this._id}`);
        if (!result.success) return result.error;
        return true;
    }
}
