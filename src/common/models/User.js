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

        static schema = Object.assign(MixinClass.schema, {
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true
            },
            nickname: String,
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
        });

        getSomething() {
            return true;
        }

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
