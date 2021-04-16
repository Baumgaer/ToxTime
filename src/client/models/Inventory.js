import ClientModel from "~client/lib/ClientModel";

export default ClientModel.buildClientExport(class GameObject extends ClientModel {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return window.$t("inventory");
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "bag-personal-icon",
            title: this.name
        };
    }

});
