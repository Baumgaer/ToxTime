import { Schema } from "mongoose";
import { isEmail } from "validator";

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
        static collection = "users";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
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
                default: ""
            },
            lastName: {
                type: String,
                default: ""
            },
            locale: {
                type: String,
                required: true,
                default: global.process.environment.APP_DEFAULT_LANGUAGE
            },
            isAdmin: {
                type: Boolean,
                required: true,
                default: false
            },
            currentGameSessions: {
                type: [{ type: Schema.Types.ObjectId, ref: "GameSession", autopopulate: true }],
                default: [],
                normalizeItems: true
            },
            solvedGameSessions: {
                type: [{ type: Schema.Types.ObjectId, ref: "GameSession", autopopulate: true }],
                default: [],
                normalizeItems: true
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
            return `${this[preferredField] || this.email}`;
        }
    }
    return User;
}
