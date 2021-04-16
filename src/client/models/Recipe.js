import { RecipeMixinClass } from "~common/models/Recipe";
import ClientModel from "~client/lib/ClientModel";
import ApiClient from "~client/lib/ApiClient";

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

    @CommonClientRecipe.action("delete", { type: "component", name: "delete-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted, true)
    async delete() {
        const result = await super.delete();
        if (result) return result;

        for (const category of ["input", "output"]) {
            for (const item of this[category]) {
                ApiClient.store.removeModel(item);
            }
        }
    }

    @CommonClientRecipe.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addRecipes";
    }

});
