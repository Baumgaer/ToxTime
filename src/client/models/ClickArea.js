import { ClickAreaMixinClass } from "~common/models/ClickArea";
import GameObject from "~client/models/GameObject";

const CommonGameObjectClickArea = ClickAreaMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class ClickArea extends CommonGameObjectClickArea {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newMaskulin")} ${window.$t('clickArea')}`;
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "cursor-default-click-icon",
            title: window.$t('clickArea')
        };
    }

    @CommonGameObjectClickArea.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonGameObjectClickArea.action("restore", { type: "component", name: "delete-restore-icon" }, () => false)
    @CommonGameObjectClickArea.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
