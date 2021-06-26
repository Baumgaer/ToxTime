import { KnowledgeMixinClass } from "~common/models/Knowledge";
import MultiLingualDescribed from "~server/models/MultiLingualDescribed";

const CommonMultiLingualDescribedKnowledge = KnowledgeMixinClass(MultiLingualDescribed.RawClass);
export default MultiLingualDescribed.RawClass.buildServerExport(class Knowledge extends CommonMultiLingualDescribedKnowledge { });
