import { ItemMixinClass } from "~common/models/Item";
import ServerModel from "~server/lib/ServerModel";

const CommonServerItem = ItemMixinClass(ServerModel);
export default ServerModel.buildServerExport(class Item extends CommonServerItem { });
