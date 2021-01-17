import { ClickAreaMixinClass } from "~common/models/ClickArea";
import ClientModel from "~client/lib/ClientModel";

const CommonClientClickArea = ClickAreaMixinClass(ClientModel);
export default ClientModel.buildClientExport(class ClickArea extends CommonClientClickArea { });
