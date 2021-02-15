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
                <div class="left">{{ $t('locale') }}</div><div class="right"></div>
                <div class="left">{{ $t('isAdmin') }}</div><div class="right"><ToggleSwitch name="isAdmin" :checked="model.isAdmin" /></div>
                <div class="left">{{ $t('isConfirmed') }}</div><div class="right"><ToggleSwitch name="isConfirmed" :checked="model.isConfirmed" /></div>
                <div class="left">{{ $t('isActive') }}</div><div class="right"><ToggleSwitch name="isActive" :checked="model.isActive" /></div>
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
    computed: {
        model() {
            // The proxy of active user will be revoked when active user is assigned to itself
            if (window.activeUser.editingModel === resolveProxy(window.activeUser)) return window.activeUser;
            return window.activeUser.editingModel;
        }
    },
    methods: {
        onSaveButtonClick() {
            console.log("test");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/UserEditor.less"></style>
