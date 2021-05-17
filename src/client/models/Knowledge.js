import { KnowledgeMixinClass } from "~common/models/Knowledge";
import ClientModel from "~client/lib/ClientModel";

const CommonClientKnowledge = KnowledgeMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Knowledge extends CommonClientKnowledge {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('knowledge')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "head-lightbulb-icon",
            title: window.$t("knowledge")
        };
    }

    @CommonClientKnowledge.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    copy() { }

});
