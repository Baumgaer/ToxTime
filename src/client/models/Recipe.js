import { RecipeMixinClass } from "~common/models/Recipe";
import ClientModel from "~client/lib/ClientModel";

const CommonClientRecipe = RecipeMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Recipe extends CommonClientRecipe {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('recipe')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    getIcon() {
        return "graph-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: window.$t("recipe")
        };
    }

    @CommonClientRecipe.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addRecipes";
    }

});
