import ClientModel from "~client/lib/ClientModel";

export default ClientModel.buildClientExport(class Hand extends ClientModel {

    static className = "Hand"

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return window.$t("hand");
            }
        }
    };

    getIcon() {
        return "hand-left-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: this.name
        };
    }

});
