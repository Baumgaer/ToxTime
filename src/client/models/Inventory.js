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

    getIcon() {
        return "bag-personal-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: this.name
        };
    }

});
