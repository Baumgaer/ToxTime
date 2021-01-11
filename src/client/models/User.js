import CommonUser from "~common/models/User";
import ApiClient from "~client/controllers/ApiClient";

export default class User extends CommonUser {

    get actions() {
        return [
            { name: "delete", symbol: { type: "component", name: "delete-icon" }, func: this.delete.bind(this) },
            { name: "lock", symbol: { type: "component", name: "lock-icon" }, if: this.isActive },
            { name: "unlock", symbol: { type: "component", name: "lock-open-icon" }, if: !this.isActive },
            { name: "edit", symbol: { type: "component", name: "lead-pencil-icon" } },
            { name: "resentConfirm", symbol: { type: "component", name: "email-check-icon" }, if: !this.isConfirmed, func: this.resentConfirm.bind(this) }
        ];
    }

    async delete() {
        const result = await ApiClient.delete(`/users/delete/${this._id}`);
        if (!result.success) return result.error;
        ApiClient.store = { name: "remove", collection: this.collection, key: this._id };
    }

    async resentConfirm() {
        const result = await ApiClient.patch(`/users/resentConfirm/${this._id}`);
        if (!result.success) return result.error;
        return true;
    }
}
