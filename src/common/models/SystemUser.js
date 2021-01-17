/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {SystemUser & T}
 */
export function SystemUserMixinClass(MixinClass) {
    class SystemUser extends MixinClass {

        static className = "SystemUser";
        static collection = "users";

        /** @type {import("mongoose").SchemaDefinition} */
        static schema = {
            creator: {
                required: false
            }
        };
    }
    return SystemUser;
}
