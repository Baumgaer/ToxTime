import { ActionObjectMixinClass } from "~common/models/ActionObject";
import GameObject from "~client/models/GameObject";

const CommonGameObjectActionObject = ActionObjectMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class ActionObject extends CommonGameObjectActionObject {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('actionObject')}`;
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "movie-open-icon",
            title: window.$t('actionObject')
        };
    }

    @CommonGameObjectActionObject.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonGameObjectActionObject.action("restore", { type: "component", name: "delete-restore-icon" }, () => false)
    @CommonGameObjectActionObject.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
