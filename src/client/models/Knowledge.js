import { KnowledgeMixinClass } from "~common/models/Knowledge";
import MultiLingualDescribed from "~client/models/MultiLingualDescribed";

const CommonMultiLingualDescribedKnowledge = KnowledgeMixinClass(MultiLingualDescribed.RawClass);
export default MultiLingualDescribed.RawClass.buildClientExport(class Knowledge extends CommonMultiLingualDescribedKnowledge {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('knowledge')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    getIcon() {
        return "head-lightbulb-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: window.$t("knowledge")
        };
    }

    @CommonMultiLingualDescribedKnowledge.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addKnowledge";
    }

});
