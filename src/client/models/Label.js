import { LabelMixinClass } from "~common/models/Label";
import ClientModel from "~client/lib/ClientModel";

const CommonClientLabel = LabelMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Label extends CommonClientLabel {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('label')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "label-icon",
            title: window.$t("label")
        };
    }

    @CommonClientLabel.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    copy() { }

});
