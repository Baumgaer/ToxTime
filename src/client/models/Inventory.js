import ClientModel from "~client/lib/ClientModel";

export default ClientModel.buildClientExport(class Inventory extends ClientModel {

    static className = "Inventory"

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
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
