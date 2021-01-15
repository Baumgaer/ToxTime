import { FileMixinClass } from "~common/models/File";
import ServerModel from "~server/lib/ServerModel";

const CommonServerFile = FileMixinClass(ServerModel);
export default ServerModel.buildServerExport(class File extends CommonServerFile { });
