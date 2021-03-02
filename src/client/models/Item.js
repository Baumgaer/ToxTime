import { ItemMixinClass } from "~common/models/Item";
import ClientModel from "~client/lib/ClientModel";

const CommonClientItem = ItemMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Item extends CommonClientItem { });
