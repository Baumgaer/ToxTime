<template>
    <main class="admin" v-bind:style="itemsCollapsed ? 'gridTemplateColumns: 200px 30px 1fr' : ''">
        <nav class="navigation" ref="navigation">
            <div class="top">
                <header>
                    <h2>{{ $t('navigation') }}</h2>
                </header>
                <Button ref="users" name="users" :active="this.category === 'users'" :showLoadingSpinner="Boolean(this.$refs.addUsers && this.$refs.addUsers.progressModel.loadingStatus)" @click="onNavButtonClick('users')" >
                    <account-icon />
                </Button>
                <Button ref="lessons" name="lessons" :active="this.category === 'lessons'" @click="onNavButtonClick('lessons')" >
                    <school-icon />
                </Button>
                <Button ref="scenes" name="scenes" :active="this.category === 'scenes'" @click="onNavButtonClick('scenes')" >
                    <theater-icon />
                </Button>
                <Button ref="sceneObjects" name="sceneObjects" :active="this.category === 'sceneObjects'" @click="onNavButtonClick('sceneObjects')" >
                    <ufo-icon />
                </Button>
                <Button ref="recipes" name="recipes" :active="this.category === 'recipes'" @click="onNavButtonClick('recipes')" >
                    <graph-icon />
                </Button>
                <Button ref="files" name="files" :active="this.category === 'files'" :showLoadingSpinner="filesLoading" @click="onNavButtonClick('files')" >
                    <file-multiple-icon />
                </Button>
            </div>
            <div class="bottom">
                <Button ref="settings" name="settings" :active="this.category === 'settings'" @click="onNavButtonClick('settings')" >
                    <cog-icon />
                </Button>
                <Button ref="logout" name="logout" @click="onLogoutButtonClick()" >
                    <logout-icon />
                </Button>
            </div>
        </nav>
        <section class="items" ref="items">
            <header :style="itemsCollapsed ? 'display: block' : ''">
                <h2 v-show="!itemsCollapsed">{{ $t(this.category) }}</h2>
                <div class="buttons">
                    <Button ref="settings" :class="!itemsCollapsed ? 'collapseButton' : 'collapseButton collapsed'" name="collapse" :showLabel="false" v-on:click="onCollapseButtonClick()" >
                        <arrow-collapse-right-icon v-if="this.itemsCollapsed" />
                        <arrow-collapse-left-icon v-else />
                    </Button>
                    <Button class="addButton" v-show="!itemsCollapsed && category !== 'settings'" name="addItem" :showLabel="false" v-on:click="onAddItemButtonClick()">
                        <plus-icon />
                    </Button>
                </div>
            </header>
            <section ref="itemList" class="list" v-show="!itemsCollapsed && category !== 'settings'">
                <div v-if="items.length">
                    <Item v-for="item in items"
                          :key="item._dummyId || item._id"
                          :model="item"
                          :style="`${'isConfirmed' in item && !item.isConfirmed ? 'opacity: 0.5' : ''}`"
                          :overlayIcons="`${item.isAdmin ? 'crown-icon' : ''}`"
                          :nameEditDBField="['User', 'SystemUser'].includes(item.className) ? 'email' : 'name'"
                    />
                </div>
                <div v-else class="empty">{{ $t('noContent') }}</div>
                <Button class="addButton" name="addItem" v-on:click="onAddItemButtonClick()">
                    <plus-icon />
                </Button>
            </section>
        </section>
        <section class="editor">
            <AddUsers ref="addUsers" v-show="window.activeUser.activeEditor === 'addUsers'" />
            <GraphicEditor v-if="['scene', 'sceneObject'].includes(window.activeUser.activeEditor)" :type="window.activeUser.activeEditor" />
            <LessonEditor v-if="window.activeUser.activeEditor === 'addLessons'" />
            <UserEditor v-if="window.activeUser.activeEditor === 'editUser'" />
        </section>
        <UploadHint ref="uploadHint" />
    </main>
</template>

<script>
import Button from "~client/components/Button.vue";
import Item from "~client/components/Item.vue";
import ApiClient from "~client/lib/ApiClient";
import AddUsers from "~client/components/AddUsers.vue";
import UploadHint from "~client/components/UploadHint";
import GraphicEditor from "~client/components/GraphicEditor";
import LessonEditor from "~client/components/LessonEditor";
import UserEditor from "~client/components/UserEditor";

import SceneObject from "~client/models/SceneObject";
import Scene from "~client/models/Scene";
import Lesson from "~client/models/Lesson";

import { capitalize } from "~common/utils";
import natSort from "natsort";

export default {
    components: {
        Button,
        Item,
        AddUsers,
        UploadHint,
        GraphicEditor,
        LessonEditor,
        UserEditor
    },
    data() {
        return {
            store: {},
            filesStore: {},
            category: "users",
            itemsCollapsed: false
        };
    },
    computed: {
        items() {
            return Object.values(this.store).sort((a, b) => {
                if (b === window.activeUser) return 1;
                return b.isAdmin - a.isAdmin || b.isConfirmed - a.isConfirmed || b.isActive - a.isActive || natSort()(a.getName(), b.getName());
            });
        },
        filesLoading() {
            return Object.values(this.filesStore).some((file) => file.loadingStatus);
        }
    },
    mounted() {
        this.filesStore = ApiClient.store.collection("files");
        this.onNavButtonClick("users");
    },
    methods: {

        async onNavButtonClick(name) {
            this.category = name;
            this.store = ApiClient.store.collection(this.category);
            await ApiClient.get(`/${name}`);
        },

        onCollapseButtonClick() {
            this.itemsCollapsed = Boolean(this.$refs.items.clientWidth > 100);
        },

        onAddItemButtonClick() {
            /** @type {string} */
            const category = this.category;
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
            setTimeout(() => {
                if (!category) return;
                if (category === "files") {
                    this.$refs.uploadHint.$refs.fileInput.click();
                } else if (["sceneObjects", "scenes"].includes(category)) {
                    window.activeUser.activeEditor = category.substring(0, category.length - 1);
                    if (category === "sceneObjects") {
                        window.activeUser.editingModel = ApiClient.store.addModel(new SceneObject.Model());
                    } else window.activeUser.editingModel = ApiClient.store.addModel(new Scene.Model());
                } else if(category === "lessons") {
                    window.activeUser.activeEditor = `add${capitalize(category)}`;
                    window.activeUser.editingModel = ApiClient.store.addModel(new Lesson.Model());
                } else window.activeUser.activeEditor = `add${capitalize(category)}`;
            });
        },

        onLogoutButtonClick() {
            location.href = "/logout";
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Admin.less"></style>
