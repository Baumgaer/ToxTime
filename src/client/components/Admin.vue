<template>
    <main class="admin" v-bind:style="itemsCollapsed ? 'gridTemplateColumns: 200px 30px 1fr' : ''">
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
            <header :style="itemsCollapsed ? 'display: block' : ''">
                <h2 v-show="!itemsCollapsed">{{ $t(this.category) }}</h2>
                <div class="buttons">
                    <Button ref="settings" :class="!itemsCollapsed ? 'collapseButton' : 'collapseButton collapsed'" name="collapse" :showLabel="false" v-on:click="onCollapseButtonClick()" >
                        <arrow-collapse-right-icon v-if="this.itemsCollapsed" />
                        <arrow-collapse-left-icon v-else />
                    </Button>
                    <Button class="addButton" v-show="!itemsCollapsed" name="addItem" :showLabel="false" v-on:click="onAddItemButtonClick()">
                        <plus-icon />
                    </Button>
                </div>
            </header>
            <section ref="itemList" class="list" v-show="!itemsCollapsed">
                <div v-if="this.items.length">
                    <Item v-for="item of this.items" :key="item.id" :model="item" />
                </div>
                <div v-else class="empty">{{ $t('noContent') }}</div>
                <Button class="addButton" name="addItem" v-on:click="onAddItemButtonClick()">
                    <plus-icon />
                </Button>
            </section>
        </section>
        <section class="editor">
            <AddUsers v-if="activeEditor === 'addUsers'" />
        </section>
    </main>
</template>

<script>
import Button from "~client/components/Button.vue";
import Item from "~client/components/Item.vue";
import ApiClient from "~client/controllers/ApiClient";
import AddUsers from "~client/components/AddUsers.vue";
import { capitalize } from "~common/utils";

export default {
    components: {
        Button,
        Item,
        AddUsers
    },
    data() {
        return {
            category: "users",
            itemsCollapsed: false,
            items: [],
            activeEditor: null
        };
    },
    mounted() {
        this.onNavButtonClick("users");
    },
    methods: {

        async onNavButtonClick(name) {
            this.category = name;
            const result = await ApiClient.get(`/${name}`);
            if (!result.success) {
                return this.items = [];
            }
            console.log(ApiClient.store);
            this.items = result.data.models;
        },

        onCollapseButtonClick() {
            this.itemsCollapsed = Boolean(this.$refs.items.clientWidth > 100);
        },

        onAddItemButtonClick() {
            this.activeEditor = `add${capitalize(this.category)}`;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Admin.less"></style>
