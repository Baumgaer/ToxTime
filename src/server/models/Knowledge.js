import { KnowledgeMixinClass } from "~common/models/Knowledge";
import ServerModel from "~server/lib/ServerModel";

const CommonServerKnowledge = KnowledgeMixinClass(ServerModel);
export default ServerModel.buildServerExport(class Knowledge extends CommonServerKnowledge { });
