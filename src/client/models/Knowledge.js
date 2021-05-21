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

    @CommonClientKnowledge.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addKnowledge";
    }

});
