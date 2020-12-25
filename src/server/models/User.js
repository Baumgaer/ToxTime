import { Schema, connection } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import User from "~common/models/User";

const schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    nickname: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    isConfirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    isActive: Boolean,
    matriculationNumber: {
        type: Number,
        required: true
    }
});

schema.loadClass(User);
schema.plugin(passportLocalMongoose, {
    usernameUnique: false,
    findByUsername: (model, queryParameters) => {
        // Add additional query parameter - AND condition - active: true
        queryParameters.active = true;
        return model.findOne(queryParameters);
    }
});
export default connection.model("User", schema);
