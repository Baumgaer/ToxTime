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

    @CommonClientRecipe.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
        if (!this._id) {
            this.destroy();
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
            return;
        }

        const result = await ApiClient.delete(`/recipes/${this._id}`);
        if ((result instanceof Error)) return result;
        ApiClient.store.removeModel(this);
    }

    @CommonClientRecipe.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addRecipes";
    }

});
