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
    matriculationNumber: {
        type: Number,
        required: true,
        unique: true
    },
    locale: {
        type: String,
        required: true,
        default: "en-US"
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    currentGameSession: String,
    solvedGameSessions: {
        type: Array,
        required: true,
        default: []
    },
    registrationDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    isConfirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    collection: "users"
});

schema.loadClass(User);
schema.plugin(passportLocalMongoose, {
    usernameUnique: false,
    usernameField: "email",
    findByUsername: (model, queryParameters) => {
        // Add additional query parameter - AND condition - active: true
        queryParameters.isConfirmed = true;
        queryParameters.isActive = true;
        return model.findOne(queryParameters);
    }
});

export default connection.model("User", schema);
