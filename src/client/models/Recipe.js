import { RecipeMixinClass } from "~common/models/Recipe";
import ClientModel from "~client/lib/ClientModel";

const CommonClientRecipe = RecipeMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Recipe extends CommonClientRecipe {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('recipe')} ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "graph-icon",
            title: window.$t("recipe")
        };
    }

    @CommonClientRecipe.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addRecipes";
    }

});
