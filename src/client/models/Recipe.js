import { RecipeMixinClass } from "~common/models/Recipe";
import ClientModel from "~client/lib/ClientModel";

const CommonClientRecipe = RecipeMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Recipe extends CommonClientRecipe { });
