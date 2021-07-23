import { LabelMixinClass } from "~common/models/Label";
import ClientModel from "~client/lib/ClientModel";

const CommonClientLabel = LabelMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Label extends CommonClientLabel {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('label')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    getIcon() {
        return "label-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: window.$t("label")
        };
    }

});
