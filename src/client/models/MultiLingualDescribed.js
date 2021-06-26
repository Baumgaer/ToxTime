import { MultiLingualDescribedMixinClass } from "~common/models/MultiLingualDescribed";
import ClientModel from "~client/lib/ClientModel";

const CommonClientMultiLingualDescribed = MultiLingualDescribedMixinClass(ClientModel);
export default ClientModel.buildClientExport(class MultiLingualDescribed extends CommonClientMultiLingualDescribed { });
