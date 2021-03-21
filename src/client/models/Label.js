import { LabelMixinClass } from "~common/models/Label";
import ClientModel from "~client/lib/ClientModel";

const CommonClientLabel = LabelMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Label extends CommonClientLabel { });
