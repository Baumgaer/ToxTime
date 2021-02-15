<template>
    <div class="userEditor">
        <EditorHead ref="editorHead" name="editUser" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <section class="editorBody">
            <h3>{{ $t('general') }}</h3>
            <section class="general">
                <div class="left">{{ $t('email') }}</div><div class="right"><input type="text" name="email" v-model="model.email" /></div>
                <div class="left">{{ $t('nickname') }}</div><div class="right"><input type="text" name="name" v-model="model.name" /></div>
                <div class="left">{{ $t('firstName') }}</div><div class="right"><input type="text" name="firstName" v-model="model.firstName" /></div>
                <div class="left">{{ $t('lastName') }}</div><div class="right"><input type="text" name="lastName" v-model="model.lastName" /></div>
                <div class="left">{{ $t('locale') }}</div>
                <div class="right">
                    <select name="locale" v-model="model.locale">
                        <option value="de-de">{{ $t('german') }}</option>
                        <option value="en-us">{{ $t('english') }}</option>
                    </select>
                </div>
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
                <div class="left">{{ $t('currentGameSession') }}</div><div class="right"></div>
                <div class="left">{{ $t('solvedGameSessions') }}</div><div class="right"></div>
            </section>
            <h3>{{ $t('password') }}</h3>
            <section class="password">
                <div class="left">{{ $t('oldPassword') }}</div><div class="right"><input type="password" name="oldPassword" /></div>
                <div class="left">{{ $t('newPassword') }}</div><div class="right"><input type="password" name="newPassword" /></div>
                <div class="left">{{ $t('repeatPassword') }}</div><div class="right"><input type="password" name="repeatPassword" /></div>
            </section>
        </section>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import ToggleSwitch from "~client/components/ToggleSwitch";
import { resolveProxy } from "~common/utils";
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
        async onSaveButtonClick() {
            this.model.save();
        },

        onToggleSwitched(name) {
            this.model[name] = this.$refs[name].$refs.input.checked;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/UserEditor.less"></style>
