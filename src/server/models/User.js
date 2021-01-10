import { Schema, connection } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import Model from "~common/models/User";
import { dataTransformer } from "~common/utils";

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
    firstName: String,
    lastName: String,
    locale: {
        type: String,
        required: true,
        default: "en-us"
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    currentGameSession: Schema.Types.ObjectId,
    solvedGameSessions: {
        type: [{ type: Schema.Types.ObjectId }],
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
    },
    passwordResetToken: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    collection: Model.collection,
    toObject: { transform: (doc, ret) => dataTransformer(doc, ret, Model) },
    toJSON: { transform: (doc, ret) => dataTransformer(doc, ret, Model) }
});

schema.loadClass(Model);
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

const TheModel = connection.model(Model.className, schema);
TheModel.className = Model.className;
export default TheModel;
