<template>
    <main class="admin" v-bind:style="itemsCollapsed ? 'gridTemplateColumns: 200px 30px 1fr' : ''">
        <nav class="navigation" ref="navigation">
            <div class="top">
                <header>
                    <h2>{{ $t('navigation') }}</h2>
                </header>
                <Button
                    ref="users"
                    name="users"
                    :active="this.category === 'users'"
                    :showLoadingSpinner="Boolean(this.$refs.addUsers && this.$refs.addUsers.progressModel.loadingStatus)"
                    @click="onNavButtonClick('users')"
                >
                    <account-icon />
                </Button>
                <Button
                    ref="lessons"
                    name="lessons"
                    :active="this.category === 'lessons'"
                    :showLoadingSpinner="somethingIsLoading('lessons')"
                    @click="onNavButtonClick('lessons')"
                >
                    <school-icon />
                </Button>
                <Button
                    ref="scenes"
                    name="scenes"
                    :active="this.category === 'scenes'"
                    :showLoadingSpinner="somethingIsLoading('scenes')"
                    @click="onNavButtonClick('scenes')"
                >
                    <theater-icon />
                </Button>
                <Button
                    ref="sceneObjects"
                    name="sceneObjects"
                    :active="this.category === 'sceneObjects'"
                    :showLoadingSpinner="somethingIsLoading('sceneObjects')"
                    @click="onNavButtonClick('sceneObjects')"
                >
                    <ufo-icon />
                </Button>
                <Button
                    ref="recipes"
                    name="recipes"
                    :active="this.category === 'recipes'"
                    :showLoadingSpinner="somethingIsLoading('recipes')"
                    @click="onNavButtonClick('recipes')"
                >
                    <graph-icon />
                </Button>
                <Button
                    ref="knowledge"
                    name="knowledge"
                    :active="this.category === 'knowledge'"
                    :showLoadingSpinner="somethingIsLoading('knowledge')"
                    @click="onNavButtonClick('knowledge')"
                >
                    <head-lightbulb-icon />
                </Button>
                <Button
                    ref="speechBubbles"
                    name="speechBubbles"
                    :active="this.category === 'speechBubbles'"
                    :showLoadingSpinner="somethingIsLoading('speechBubbles')"
                    @click="onNavButtonClick('speechBubbles')"
                >
                    <comment-text-multiple-icon />
                </Button>
                <Button
                    ref="files"
                    name="files"
                    :active="this.category === 'files'"
                    :showLoadingSpinner="somethingIsLoading('files')"
                    @click="onNavButtonClick('files')"
                >
                    <file-multiple-icon />
                </Button>
                <Button
                    ref="labels"
                    name="labels"
                    :active="this.category === 'labels'"
                    :showLoadingSpinner="somethingIsLoading('labels')"
                    @click="onNavButtonClick('labels')"
                >
                    <label-multiple-icon />
                </Button>
                <Button ref="trash" name="trash" :active="this.category === 'trash'" @click="onNavButtonClick('trash')" >
                    <trash-can-icon />
                </Button>
            </div>
            <div class="bottom">
                <Button ref="settings" name="settings" :active="this.category === 'settings'" @click="window.activeUser.edit()" >
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
                    <Button ref="collapseAll" class="collapseAllButton" v-show="!itemsCollapsed" name="collapseAll" :showLabel="false" v-on:click="onCollapseAllButtonClick()" >
                        <collapse-all-icon />
                    </Button>
                    <Button class="addButton" v-show="!itemsCollapsed && category !== 'trash'" name="addItem" :showLabel="false" v-on:click="onAddItemButtonClick()">
                        <plus-icon />
                    </Button>
                </div>
            </header>
            <section class="search">
                <input v-show="!itemsCollapsed" v-model="search" type="text" name="search" autocomplete="disable" :placeholder="$t('search')" />
            </section>
            <BatchBar :items="items" />
            <section ref="itemList" class="list" v-show="!itemsCollapsed">
                <div v-if="items.length" ref="itemsList">
                    <item-component v-for="item in items"
                                    :key="item._dummyId || item._id"
                                    :model="item"
                                    :style="`${'isConfirmed' in item && !item.isConfirmed ? 'opacity: 0.5' : ''}`"
                                    :nameEditDBField="['User', 'SystemUser'].includes(item.className) ? 'email' : 'name'"
                                    :showCheckbox="true"
                                    :ref="item._dummyId || item._id"
                    />
                </div>
                <div v-else class="empty" ref="itemsList">{{ $t('noContent') }}</div>
                <Button v-show="category !== 'trash'" class="addButton" name="addItem" v-on:click="onAddItemButtonClick()">
                    <plus-icon />
                </Button>
            </section>
        </section>
        <section class="editor">
            <Usage v-if="!window.activeUser.activeEditor" :category='category' />
            <AddUsers ref="addUsers" v-show="window.activeUser.activeEditor === 'addUsers'" />
            <GraphicEditor :ref="window.activeUser.activeEditor" v-if="['scene', 'sceneObject'].includes(window.activeUser.activeEditor)" :type="window.activeUser.activeEditor" />
            <LessonEditor :ref="window.activeUser.activeEditor" v-if="window.activeUser.activeEditor === 'addLessons'" />
            <UserEditor :ref="window.activeUser.activeEditor" v-if="window.activeUser.activeEditor === 'editUser'" />
            <RecipeEditor :ref="window.activeUser.activeEditor" v-if="window.activeUser.activeEditor === 'addRecipes'" :model="window.activeUser.editingModel" />
            <KnowledgeEditor :ref="window.activeUser.activeEditor" v-if="window.activeUser.activeEditor === 'addKnowledge'" />
            <SpeechBubbleEditor :ref="window.activeUser.activeEditor" v-if="window.activeUser.activeEditor === 'addSpeechBubbles'" />
            <Player
                v-if="window.activeUser.editingModel && window.activeUser.editingModel.className === 'GameSession'"
                v-show="window.activeUser.activeEditor === 'playGame'"
                :model="window.activeUser.editingModel"
                :preventAutosave="true"
            />
        </section>
        <UploadHint ref="uploadHint" />
    </main>
</template>

<script>
import Button from "~client/components/Button.vue";
import ApiClient from "~client/lib/ApiClient";
import AddUsers from "~client/components/AddUsers.vue";
import UploadHint from "~client/components/UploadHint";
import GraphicEditor from "~client/components/GraphicEditor";
import LessonEditor from "~client/components/LessonEditor";
import UserEditor from "~client/components/UserEditor";
import Player from "~client/components/Player";
import RecipeEditor from "~client/components/RecipeEditor";
import Usage from "~client/components/Usage";
import KnowledgeEditor from "~client/components/KnowledgeEditor";
import BatchBar from "~client/components/BatchBar";
import SpeechBubbleEditor from "~client/components/SpeechBubbleEditor";

import SceneObject from "~client/models/SceneObject";
import Scene from "~client/models/Scene";
import Lesson from "~client/models/Lesson";
import Label from "~client/models/Label";
import Recipe from "~client/models/Recipe";
import Knowledge from "~client/models/Knowledge";
import SpeechBubble from "~client/models/SpeechBubble";

import { capitalize } from "~common/utils";
import { itemFilterAndSort } from "~client/utils";

export default {
    components: {
        Button,
        AddUsers,
        UploadHint,
        GraphicEditor,
        LessonEditor,
        UserEditor,
        Player,
        RecipeEditor,
        Usage,
        KnowledgeEditor,
        BatchBar,
        SpeechBubbleEditor
    },
    data() {
        return {
            store: {},
            trash: ApiClient.store.trash,
            filesStore: {},
            category: "users",
            itemsCollapsed: false,
            search: "",
            focusInputField: null,
            waitInterval: null
        };
    },
    computed: {
        items() {
            const items = Object.values(this.store).filter((item) => {
                if (this.category !== "trash" && item.deleted) return false;
                if (this.category === "trash" && (!item.deleted || !item.actions?.restore?.condition)) return false;
                return true;
            });
            return itemFilterAndSort(items, this.search);
        },
        somethingIsLoading() {
            return (dataCollectionName) => Object.values(ApiClient.store.collection(dataCollectionName)).some((model) => model.loadingStatus !== 0);
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
            if (name === "trash") this.store = ApiClient.store.trash;
        },

        onCollapseButtonClick() {
            this.itemsCollapsed = Boolean(this.$refs.items.clientWidth > 100);
        },

        onCollapseAllButtonClick() {

            const collapseChildren = (children) => {
                for (const child of children) {
                    if (!child.isItem) continue;
                    if (child.hasSubObjects) collapseChildren(child.$children);
                    child.opened = false;
                }
            };

            for (const item of this.items) {
                const component = this.$refs[item._id]?.[0];
                if (!component) continue;
                const allChildrenCollapsed = component.$children.every((child) => !child.opened);
                if (component.hasSubObjects) collapseChildren(component.$children);
                if (allChildrenCollapsed) component.opened = false;
            }
        },

        async onAddItemButtonClick() {
            /** @type {string} */
            const category = this.category;
            const oldActiveEditor = window.activeUser.activeEditor;

            if (window.activeUser.editingModel && !window.activeUser.editingModel.isValid()) {
                window.missingRequirementsMessageTrigger(window.activeUser.editingModel);
                return;
            }

            clearInterval(this.waitInterval);
            const waitForEditorDistortion = () => {
                const editorHead = this.$refs[oldActiveEditor]?.$refs?.editorHead;
                return new Promise((resolve) => {
                    if (!editorHead) return resolve();
                    this.waitInterval = setInterval(() => {
                        if (editorHead?.finishedDestroy) {
                            clearInterval(this.waitInterval);
                            resolve();
                        }
                    });
                });
            };

            if (!["files", "labels"].includes(category)) {
                window.activeUser.activeEditor = null;
                if (oldActiveEditor) await waitForEditorDistortion();
                window.activeUser.editingModel = null;
            }

            setTimeout(() => {
                if (!category) return;
                if (category === "files") {
                    this.$refs.uploadHint.$refs.fileInput.click();
                } else if (["sceneObjects", "scenes"].includes(category)) {
                    if (category === "sceneObjects") {
                        window.activeUser.editingModel = ApiClient.store.addModel(new SceneObject.Model());
                    } else window.activeUser.editingModel = ApiClient.store.addModel(new Scene.Model());
                    window.activeUser.activeEditor = category.substring(0, category.length - 1);
                } else if(category === "lessons") {
                    window.activeUser.editingModel = ApiClient.store.addModel(new Lesson.Model());
                    window.activeUser.activeEditor = `add${capitalize(category)}`;
                } else if (category === "labels") {
                    const addedModel = ApiClient.store.addModel(new Label.Model());
                    addedModel.save();
                } else if (category === "recipes") {
                    window.activeUser.editingModel = ApiClient.store.addModel(new Recipe.Model());
                    window.activeUser.activeEditor = `add${capitalize(category)}`;
                } else if (category === "knowledge") {
                    window.activeUser.editingModel = ApiClient.store.addModel(new Knowledge.Model());
                    window.activeUser.activeEditor = `add${capitalize(category)}`;
                } else if (category === "speechBubbles") {
                    window.activeUser.editingModel = ApiClient.store.addModel(new SpeechBubble.Model());
                    window.activeUser.activeEditor = `add${capitalize(category)}`;
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
