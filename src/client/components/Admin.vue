<template>
    <main class="admin" v-bind:style="itemsCollapsed ? 'gridTemplateColumns: 200px 40px 1fr' : ''">
        <nav class="navigation" ref="navigation">
            <header>
                <h2>{{ $t('navigation') }}</h2>
            </header>
            <div class="button" ref="users" v-on:click="onNavButtonClick('users')">
                <div class="icon"><account-icon /></div>
                <div class="label">{{ $t('users') }}</div>
            </div>
            <div class="button" ref="lessons" v-on:click="onNavButtonClick('lessons')">
                <div class="icon"><school-icon /></div>
                <div class="label">{{ $t('lessons') }}</div>
            </div>
            <div class="button" ref="scenes" v-on:click="onNavButtonClick('scenes')">
                <div class="icon"><theater-icon /></div>
                <div class="label">{{ $t('scenes') }}</div>
            </div>
            <div class="button" ref="objects" v-on:click="onNavButtonClick('objects')">
                <div class="icon"><ufo-icon /></div>
                <div class="label">{{ $t('objects') }}</div>
            </div>
            <div class="button" ref="recipes" v-on:click="onNavButtonClick('recipes')">
                <div class="icon"><graph-icon /></div>
                <div class="label">{{ $t('recipes') }}</div>
            </div>
            <div class="button" ref="settings" v-on:click="onNavButtonClick('settings')">
                <div class="icon"><cog-icon /></div>
                <div class="label">{{ $t('settings') }}</div>
            </div>
        </nav>
        <section class="items" ref="items">
            <header>
                <h2 v-show="!itemsCollapsed">{{ $t(this.category) }}</h2>
                <div :class="!itemsCollapsed ? 'button' : 'button collapsed'" v-on:click="onCollapseButtonClick()">
                    <arrow-collapse-right-icon v-if="this.itemsCollapsed" />
                    <arrow-collapse-left-icon v-else />
                </div>
            </header>
            <section ref="itemList" class="list" v-show="!itemsCollapsed">
                TEST!
            </section>
        </section>
        <section class="editor">

        </section>
    </main>
</template>

<script>
import AccountIcon from "vue-material-design-icons/Account";
import SchoolIcon from "vue-material-design-icons/School";
import TheaterIcon from "vue-material-design-icons/Theater";
import UfoIcon from "vue-material-design-icons/Ufo";
import GraphIcon from "vue-material-design-icons/Graph";
import CogIcon from "vue-material-design-icons/Cog";
import ArrowCollapseLeftIcon from "vue-material-design-icons/ArrowCollapseLeft";
import ArrowCollapseRightIcon from "vue-material-design-icons/ArrowCollapseRight";

export default {
    components: {
        AccountIcon,
        SchoolIcon,
        TheaterIcon,
        UfoIcon,
        GraphIcon,
        CogIcon,
        ArrowCollapseLeftIcon,
        ArrowCollapseRightIcon
    },
    data() {
        return {
            category: "users",
            itemsCollapsed: false
        };
    },
    mounted() {
        this.onNavButtonClick("users");
    },
    methods: {
        onNavButtonClick(name) {
            const buttons = Array.from(this.$refs.navigation.getElementsByClassName("button"));
            for (const button of buttons) {
                button.classList.remove("active");
            }
            this.$refs[name].classList.add("active");
            this.category = name;
        },
        onCollapseButtonClick() {
            this.itemsCollapsed = Boolean(this.$refs.items.clientWidth > 100);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Admin.less"></style>
