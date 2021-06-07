import { EntityMixinClass } from "~common/models/Entity";
import ClientModel from "~client/lib/ClientModel";

const CommonClientEntity = EntityMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Entity extends CommonClientEntity {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newFeminin")} ${window.$t('entity')}`;
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "identifier-icon",
            title: window.$t("entity")
        };
    }

    get objects() {
        return [...this.actionObjects, ...this.clickAreas];
    }

});
