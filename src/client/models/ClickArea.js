import { ClickAreaMixinClass } from "~common/models/ClickArea";
import GameObject from "~client/models/GameObject";
import ApiClient from "~client/lib/ApiClient";

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

    @CommonGameObjectClickArea.action("restore", { type: "component", name: "delete-restore-icon" }, (instance) => {
        const indexes = ApiClient.store.indexes;
        const mayContainingScene = Array.from(indexes.scenes?.get(instance)?.values() || [])?.[0];
        const mayContainingSceneObject = Array.from(indexes.sceneObjects?.get(instance)?.values() || [])?.[0];
        return window.activeUser.isAdmin && instance.deleted && !(mayContainingScene?.deleted || mayContainingSceneObject?.deleted);
    })
    restore() {
        return super.restore();
    }

    @CommonGameObjectClickArea.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonGameObjectClickArea.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
