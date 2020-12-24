import { Schema, connection } from "mongoose";
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
    matriculationNumber: {
        type: Number,
        required: true
    }
});

schema.loadClass(User);
export default connection.model("User", schema);
