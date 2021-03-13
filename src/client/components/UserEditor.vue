<template>
    <div class="userEditor">
        <EditorHead ref="editorHead" name="settings" :onSaveButtonClick="onSaveButtonClick.bind(this)" @closeButtonClick="$emit('closeButtonClick')" />
        <section class="editorBody">
            <h3>{{ $t('general') }}</h3>
            <section class="general">
                <div class="left">{{ $t('email') }}</div><div class="right"><input type="text" ref="email" autocomplete="email" name="email" v-model="model.email" @change="onInputChange()" /></div>
                <div class="left">{{ $t('nickname') }}</div><div class="right"><input type="text" autocomplete="nickname" name="name" v-model="model.name" @change="onInputChange()" /></div>
                <div class="left">{{ $t('firstName') }}</div><div class="right"><input type="text" autocomplete="name" name="firstName" v-model="model.firstName" @change="onInputChange()" /></div>
                <div class="left">{{ $t('lastName') }}</div><div class="right"><input type="text" autocomplete="family-name" name="lastName" v-model="model.lastName" @change="onInputChange()" /></div>
                <div class="left">{{ $t('locale') }}</div>
                <div class="right">
                    <select ref="locale" autocomplete="language" name="locale" v-model="model.locale" @change="onLanguageChange()">
                        <option value="de-de">{{ $t('german') }}</option>
                        <option value="en-us">{{ $t('english') }}</option>
                    </select>
                </div>
            </section>
            <h3 v-if="window.activeUser.isAdmin">{{ $t('accessRights') }}</h3>
            <section v-if="window.activeUser.isAdmin">
                <div class="left">{{ $t('isAdmin') }}</div>
                <div class="right">
                    <ToggleSwitch ref="isAdmin" name="isAdmin" :checked="model.isAdmin" @change="onToggleSwitched('isAdmin')" />
                </div>
                <div class="left">{{ $t('isConfirmed') }}</div>
                <div class="right">
                    <ToggleSwitch ref="isConfirmed" name="isConfirmed" :checked="model.isConfirmed" @change="onToggleSwitched('isConfirmed')" />
                </div>
                <div class="left">{{ $t('isActive') }}</div>
                <div class="right">
                    <ToggleSwitch ref="isActive" name="isActive" :checked="model.isActive" @change="onToggleSwitched('isActive')" />
                </div>
            </section>
            <h3>{{ $t('lessons') }}</h3>
            <section>
                <div class="left">{{ $t('currentGameSessions') }}</div><div class="right">
                    <div class="gameSessionLabel" v-for="session in model.currentGameSessions" :key="session._id">
                        <span>{{ session.getName() }}</span>
                        <span class="x" @click="onSessionRemove(session, 'currentGameSessions')">X</span>
                    </div>
                </div>
                <div class="left">{{ $t('solvedGameSessions') }}</div><div class="right">
                    <div class="gameSessionLabel" v-for="session in model.solvedGameSessions" :key="session._id">
                        <span>{{ session.getName() }}</span>
                        <span class="x" @click="onSessionRemove(session, 'solvedGameSessions')">X</span>
                    </div>
                </div>
            </section>
            <h3 v-if="model === window.activeUser">{{ $t('password') }}</h3>
            <section v-if="model === window.activeUser" class="password">
                <div class="left">{{ $t('oldPassword') }}</div><div class="right"><input ref="oldPassword" autocomplete="current-password" type="password" name="oldPassword" @change="onInputChange()" /></div>
                <div class="left">{{ $t('newPassword') }}</div><div class="right"><input ref="newPassword" autocomplete="new-password" type="password" name="newPassword" @change="onInputChange()" /></div>
                <div class="left">{{ $t('repeatPassword') }}</div><div class="right"><input ref="repeatPassword" autocomplete="new-password" type="password" name="repeatPassword" @change="onInputChange()" /></div>
            </section>
        </section>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import ToggleSwitch from "~client/components/ToggleSwitch";
import { resolveProxy } from "~common/utils";
import i18n from "~client/lib/i18n";
import ApiClient from "~client/lib/ApiClient";

export default {
    components: {
        EditorHead,
        ToggleSwitch
    },
    data() {
        return {
            savedForDestroy: null
        };
    },
    computed: {
        model() {
            // The proxy of active user will be revoked when active user is assigned to itself
            if (window.activeUser.editingModel === resolveProxy(window.activeUser)) return window.activeUser;
            return window.activeUser.editingModel;
        }
    },
    mounted() {
        this.savedForDestroy = this.model;
    },
    async beforeDestroy() {
        const hasChanges = this.savedForDestroy.hasChangesDeep();
        if (!this.$refs.editorHead.closeButtonClicked) {
            // Cases editor was closed unexpected
            if (hasChanges || this.savedForDestroy.isNew()) {
                const result = await this.savedForDestroy.save();
                if (!result || result instanceof Error) return;
                this.$toasted.success(window.vm.$t("saved", { name: this.savedForDestroy.getName() }), { className: "successToaster" });
            }
        } else {
            if (!this.savedForDestroy.isNew()) {
                if (hasChanges) {
                    this.$toasted.info(window.vm.$t("discarded", { name: this.savedForDestroy.getName() }), { className: "infoToaster" });
                    this.savedForDestroy.discardDeep();
                }
            } else {
                this.savedForDestroy.destroy();
                this.$toasted.info(window.vm.$t("discarded", { name: this.savedForDestroy.getName() }), { className: "infoToaster" });
            }
        }
    },
    methods: {
        changePassword() {
            return this.$refs.oldPassword.value && (this.$refs.newPassword.value || this.$refs.repeatPassword.value);
        },

        onInputChange() {
            for (const ref in this.$refs) {
                if (Object.hasOwnProperty.call(this.$refs, ref)) {
                    const element = this.$refs[ref];
                    if (element.tagName === "INPUT") element.classList.remove("fail");
                }
            }
        },

        onSaveButtonClick() {
            if (this.model.hasChanges()) this.onSettingsChange();
            if (this.changePassword()) this.onPasswordChange();

        },

        onSessionRemove(session, category) {
            const index = this.model[category].indexOf(session);
            this.model[category].splice(index, 1);
        },

        async onPasswordChange() {
            // Check if new password was filled
            if (!this.$refs.newPassword.value) {
                this.$refs.newPassword.classList.add("fail");
                this.$toasted.error(window.vm.$t("passwordNotFilled"), { className: "errorToaster" });
                return;
            }

            // Check for typo in password
            if (this.$refs.newPassword.value !== this.$refs.repeatPassword.value) {
                this.$refs.newPassword.classList.add("fail");
                this.$refs.repeatPassword.classList.add("fail");
                this.$toasted.error(window.vm.$t("passwordsNotEqual"), { className: "errorToaster" });
                return;
            }

            // Everything was ok. Check of old password will be done on server side
            const passwordResult = await ApiClient.patch(`/users/${this.model._id}`, {
                oldPassword: this.$refs.oldPassword.value,
                newPassword: this.$refs.newPassword.value,
                repeatPassword: this.$refs.repeatPassword.value
            });

            if (passwordResult instanceof Error) {
                if (passwordResult.field) this.$refs[passwordResult.field].classList.add("fail");
                this.$toasted.error(window.vm.$t(passwordResult.name), { className: "errorToaster" });
                return;
            }

            this.$toasted.success(window.vm.$t("saved", { name: i18n.t('password') }), { className: "successToaster" });
        },

        async onSettingsChange() {
            const changeResult = await this.model.save();
            if (changeResult instanceof Error) {
                if (changeResult.field) this.$refs[changeResult.field].classList.add("fail");
                this.$toasted.error(window.vm.$t(changeResult.name), { className: "errorToaster" });
                return;
            }
            this.$toasted.success(window.vm.$t("saved", { name: i18n.t('settings') }), { className: "successToaster" });
        },

        onToggleSwitched(name) {
            this.model[name] = this.$refs[name].$refs.input.checked;
        },

        onLanguageChange() {
            if (this.model !== window.activeUser) return;
            i18n.locale = this.$refs.locale.value;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/UserEditor.less"></style>
