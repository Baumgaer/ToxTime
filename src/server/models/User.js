import passportLocalMongoose from "passport-local-mongoose";
import { UserMixinClass } from "~common/models/User";
import ServerModel from "~server/lib/ServerModel";

const CommonServerUser = UserMixinClass(ServerModel);
export default ServerModel.buildServerExport(class User extends CommonServerUser {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        passwordResetToken: {
            type: String,
            unique: true,
            sparse: true,
            select: false
        }
    };

}, [[passportLocalMongoose, {
    usernameUnique: false,
    usernameField: "email",
    findByUsername: (model, queryParameters) => {
        // Add additional query parameter - AND condition - active: true
        queryParameters.isConfirmed = true;
        queryParameters.isActive = true;
        return model.findOne(queryParameters);
    }
}]]);
