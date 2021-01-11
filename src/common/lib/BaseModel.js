export default class BaseModel {

    getName(preferredField) {
        return this[preferredField] || "";
    }

    getAvatar() {
        return null;
    }

    get actions() {
        return [];
    }

}

BaseModel.className = "BaseModel";
BaseModel.collection = "unknown";
