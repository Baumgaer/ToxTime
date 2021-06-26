import { MultiLingualDescribedMixinClass } from "~common/models/MultiLingualDescribed";
import ServerModel from "~server/lib/ServerModel";

const CommonServerMultiLingualDescribed = MultiLingualDescribedMixinClass(ServerModel);
export default ServerModel.buildServerExport(class MultiLingualDescribed extends CommonServerMultiLingualDescribed { });
