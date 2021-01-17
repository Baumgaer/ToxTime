import { ClickAreaMixinClass } from "~common/models/ClickArea";
import ServerModel from "~server/lib/ServerModel";

const CommonServerClickArea = ClickAreaMixinClass(ServerModel);
export default ServerModel.buildServerExport(class ClickArea extends CommonServerClickArea { });
