<template>
    <main class="admin" v-bind:style="itemsCollapsed ? 'gridTemplateColumns: 200px 40px 1fr' : ''">
        <nav class="navigation" ref="navigation">
            <header>
                <h2>{{ $t('navigation') }}</h2>
            </header>
            <Button ref="users" name="users" :active="this.category === 'users'" v-on:click="onNavButtonClick('users')" >
                <account-icon />
            </Button>
            <Button ref="lessons" name="lessons" :active="this.category === 'lessons'" v-on:click="onNavButtonClick('lessons')" >
                <school-icon />
            </Button>
            <Button ref="scenes" name="scenes" :active="this.category === 'scenes'" v-on:click="onNavButtonClick('scenes')" >
                <theater-icon />
            </Button>
            <Button ref="objects" name="objects" :active="this.category === 'objects'" v-on:click="onNavButtonClick('objects')" >
                <ufo-icon />
            </Button>
            <Button ref="recipes" name="recipes" :active="this.category === 'recipes'" v-on:click="onNavButtonClick('recipes')" >
                <graph-icon />
            </Button>
            <Button ref="settings" name="settings" :active="this.category === 'settings'" v-on:click="onNavButtonClick('settings')" >
                <cog-icon />
            </Button>
        </nav>
        <section class="items" ref="items">
            <header>
                <h2 v-show="!itemsCollapsed">{{ $t(this.category) }}</h2>
                <Button ref="settings" :class="!itemsCollapsed ? '' : 'collapsed'" name="collapse" :showLabel="false" v-on:click="onCollapseButtonClick()" >
                    <arrow-collapse-right-icon v-if="this.itemsCollapsed" />
                    <arrow-collapse-left-icon v-else />
                </Button>
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
import Button from "~client/components/Button.vue";

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
        ArrowCollapseRightIcon,
        Button
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
            this.category = name;
        },
        onCollapseButtonClick() {
            this.itemsCollapsed = Boolean(this.$refs.items.clientWidth > 100);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Admin.less"></style>
