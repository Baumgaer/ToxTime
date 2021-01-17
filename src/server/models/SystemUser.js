import passportLocalMongoose from "passport-local-mongoose";
import { SystemUserMixinClass } from "~common/models/SystemUser";
import User from "~server/models/User";

const CommonServerSystemUser = SystemUserMixinClass(User.RawClass);
export default User.RawClass.buildServerExport(class SystemUser extends CommonServerSystemUser { }, [[passportLocalMongoose, {
    usernameUnique: false,
    usernameField: "email",
    findByUsername: (model, queryParameters) => {
        // Add additional query parameter - AND condition - active: true
        queryParameters.isConfirmed = true;
        queryParameters.isActive = true;
        return model.findOne(queryParameters);
    }
}]]);
