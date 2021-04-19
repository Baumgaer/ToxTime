import ClientModel from "~client/lib/ClientModel";

export default ClientModel.buildClientExport(class Hand extends ClientModel {

    static className = "Hand"

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return window.$t("hand");
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "hand-left-icon",
            title: this.name
        };
    }

});
