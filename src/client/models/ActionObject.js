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

});
