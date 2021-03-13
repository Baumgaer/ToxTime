<template>
    <section class="public">
        <nav class="navigation" ref="navigation" v-show="model.activeEditor !== 'playGame'">
            <Button ref="lessons" name="lessons" :active="this.category === 'lessons'" @click="onNavButtonClick('lessons')">
                <school-icon />
            </Button>
            <Button ref="settings" name="settings" :active="this.category === 'settings'" @click="onSettingsButtonClick()">
                <cog-icon />
            </Button>
            <Button ref="logout" name="logout" :active="this.category === 'logout'" @click="onLogoutButtonClick()">
                <logout-icon />
            </Button>
        </nav>
        <main class="main" :style="model.activeEditor === 'playGame' ? 'grid-area: nav / main' : '' ">
            <UserEditor
                v-if="model.editingModel && ['User', 'SystemUser'].includes(model.editingModel.className)"
                v-show="model.activeEditor === 'editUser' && this.category === 'settings'"
                @closeButtonClick="onEditUserCloseButtonClick()"
            />
            <Player
                v-if="model.editingModel && model.editingModel.className === 'GameSession'"
                v-show="model.activeEditor === 'playGame'"
                :model="model.editingModel"
            />
            <section v-show="this.category === 'lessons' && model.activeEditor !== 'playGame'" class="lessons">
                <h3>{{ $t('currentGameSessions') }}</h3>
                <LessonList :lessons="activeLessons" />
                <h3>{{ $t('remainingLessons') }}</h3>
                <LessonList :lessons="remainingLessons" :itemsAreRemovable="false" />
                <h3>{{ $t('solvedGameSessions') }}</h3>
                <LessonList :lessons="solvedLessons" />
            </section>
        </main>
    </section>
</template>

<script>
import Button from "~client/components/Button";
import UserEditor from "~client/components/UserEditor";
import LessonList from "~client/components/LessonsList";
import Player from "~client/components/Player";
import ApiClient from "~client/lib/ApiClient";

export default {
    components: {
        Button,
        UserEditor,
        LessonList,
        Player
    },
    data() {
        return {
            store: {},
            model: window.activeUser,
            category: "lessons",
            lastCategory: "",
            lessonsStore: ApiClient.store.collection("lessons")
        };
    },
    computed: {
        lessons() {
            return Object.values(this.lessonsStore);
        },
        remainingLessons() {
            return this.lessons.filter((lesson) => {
                return !this.activeLessons.includes(lesson) && !this.solvedLessons.includes(lesson);
            });
        },
        activeLessons() {
            return this.lessons.filter((lesson) => {
                return window.activeUser.currentGameSessions.find((gameSession) => gameSession.lesson === lesson);
            });
        },
        solvedLessons() {
            return this.lessons.filter((lesson) => {
                return window.activeUser.solvedGameSessions.find((gameSession) => gameSession.lesson === lesson);
            });
        }
    },
    mounted() {
        this.onNavButtonClick("lessons");
    },
    methods: {
        async onNavButtonClick(name) {
            this.category = name;
            this.store = ApiClient.store.collection(this.category);
            await ApiClient.get(`/${name}`);
        },

        onEditUserCloseButtonClick() {
            this.onNavButtonClick(this.lastCategory);
        },

        onSettingsButtonClick() {
            this.lastCategory = this.category;
            this.category = "settings";
            window.activeUser.edit();
        },

        onLogoutButtonClick() {
            location.href = "/logout";
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Public.less"></style>
