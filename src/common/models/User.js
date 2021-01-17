import { Schema } from "mongoose";

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
                trim: true
            },
            name: {
                required: false
            },
            firstName: String,
            lastName: String,
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
            currentGameSession: Schema.Types.ObjectId,
            solvedGameSessions: {
                type: [{ type: Schema.Types.ObjectId }],
                required: true,
                default: []
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

        getAvatar() {
            return {
                type: "component",
                name: "account-icon"
            };
        }
    }
    return User;
}
