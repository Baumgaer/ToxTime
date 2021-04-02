import { RecipeMixinClass } from "~common/models/Recipe";
import ServerModel from "~server/lib/ServerModel";

const CommonServerRecipe = RecipeMixinClass(ServerModel);
export default ServerModel.buildServerExport(class Recipe extends CommonServerRecipe { });
