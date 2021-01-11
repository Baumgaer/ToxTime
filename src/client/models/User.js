import CommonUser from "~common/models/User";
import ApiClient from "~client/controllers/ApiClient";

export default class User extends CommonUser {

    get actions() {
        return [
            { name: "delete", symbol: { type: "component", name: "delete-icon" }, func: this.delete.bind(this) },
            { name: "lock", symbol: { type: "component", name: "lock-icon" }, if: this.isActive },
            { name: "unlock", symbol: { type: "component", name: "lock-open-icon" }, if: !this.isActive },
            { name: "edit", symbol: { type: "component", name: "lead-pencil-icon" } },
            { name: "resentConfirm", symbol: { type: "component", name: "email-check-icon" }, if: !this.isConfirmed }
        ];
    }

    async delete() {
        const result = await ApiClient.delete(`/users/delete/${this._id}`);
        console.log(result);
        if (!result.success) return result.error;
        ApiClient.store = { name: "remove", collection: this.collection, key: this._id };
    }
}
