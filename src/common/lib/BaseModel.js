export default class BaseModel {

    getName(preferredField) {
        return this[preferredField] || "";
    }

    getAvatar() {
        return null;
    }

    getActions() {
        return [];
    }

}

BaseModel.className = "BaseModel";
BaseModel.collection = "unknown";
