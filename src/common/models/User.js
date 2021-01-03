import BaseModel from "~common/lib/BaseModel";

export default class User extends BaseModel {

    getName(preferredField) {
        return `${this[preferredField] || this.email}`;
    }

    getAvatar() {
        return {
            type: "component",
            name: "account-icon"
        };
    }
}

User.className = "User";
User.collection = "users";
