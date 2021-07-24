import { SpeechBubbleMixinClass } from "~common/models/SpeechBubble";
import MultiLingualDescribed from "~client/models/MultiLingualDescribed";

const CommonMultiLingualDescribedSpeechBubble = SpeechBubbleMixinClass(MultiLingualDescribed.RawClass);
export default MultiLingualDescribed.RawClass.buildClientExport(class SpeechBubble extends CommonMultiLingualDescribedSpeechBubble {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newFeminin")} ${window.$t('speechBubble')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    getIcon() {
        return "comment-text-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: window.$t("speechBubble")
        };
    }

    getOverwritableFields(lesson) {
        return super.getOverwritableFields(lesson, ["userName", "lessonName", "currentSceneName"]);
    }

    @CommonMultiLingualDescribedSpeechBubble.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addSpeechBubbles";
    }

});
