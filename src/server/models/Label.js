import { LabelMixinClass } from "~common/models/Label";
import ServerModel from "~server/lib/ServerModel";

const CommonServerLabel = LabelMixinClass(ServerModel);
export default ServerModel.buildServerExport(class Label extends CommonServerLabel { });
