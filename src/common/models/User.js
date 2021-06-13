import { Schema } from "mongoose";
import { isEmail } from "validator";
import { escape, unescape } from "~common/utils";

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {User & T}
 */
export function UserMixinClass(MixinClass) {
    class User extends MixinClass {

        static className = "User";
        static dataCollectionName = "users";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
                set: escape,
                validate: {
                    validator: (value) => {
                        return typeof value === "string" && isEmail(value);
                    },
                    name: "notAnEmail",
                    type: "invalid"
                }
            },
            name: {
                required: false
            },
            firstName: {
                type: String,
                default: "",
                set: escape
            },
            lastName: {
                type: String,
                default: "",
                set: escape
            },
            locale: {
                type: String,
                enum: ["de-de", "en-us"],
                required: true,
                default: global.process.environment.APP_DEFAULT_LANGUAGE,
                set: escape
            },
            isAdmin: {
                type: Boolean,
                required: true,
                default: false
            },
            currentGameSessions: {
                type: [{ type: Schema.Types.ObjectId, ref: "GameSession", autopopulate: true }],
                required: true,
                default: [],
                dependant: true
            },
            solvedGameSessions: {
                type: [{ type: Schema.Types.ObjectId, ref: "GameSession", autopopulate: true }],
                required: true,
                default: [],
                dependant: true
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
        };

        getName(preferredField) {
            return unescape(`${this[preferredField] || this.email}`);
        }
    }
    return User;
}
