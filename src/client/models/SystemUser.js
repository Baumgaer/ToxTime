import { SystemUserMixinClass } from "~common/models/SystemUser";
import User from "~client/models/User";

const CommonClientSystemUser = SystemUserMixinClass(User.RawClass);
export default User.RawClass.buildClientExport(class SystemUser extends CommonClientSystemUser { });
