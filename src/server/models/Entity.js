import { EntityMixinClass } from "~common/models/Entity";
import ServerModel from "~server/lib/ServerModel";

const CommonServerEntity = EntityMixinClass(ServerModel);
export default ServerModel.buildServerExport(class Entity extends CommonServerEntity { });
