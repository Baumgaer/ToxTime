<template>
    <section class="public">
        <nav class="navigation" ref="navigation">
            <Button ref="lessons" name="lessons" :active="this.category === 'lessons'" @click="onNavButtonClick('lessons')">
                <school-icon />
            </Button>
            <Button ref="settings" name="settings" :active="this.category === 'settings'" @click="onNavButtonClick('settings')">
                <cog-icon />
            </Button>
            <Button ref="logout" name="logout" :active="this.category === 'logout'" @click="onLogoutButtonClick()">
                <logout-icon />
            </Button>
        </nav>
        <main class="main"></main>
    </section>
</template>

<script>
import Button from "~client/components/Button";
import ApiClient from "~client/lib/ApiClient";

export default {
    components: {
        Button
    },
    data() {
        return {
            store: {},
            category: "lessons"
        };
    },
    methods: {
        async onNavButtonClick(name) {
            this.category = name;
            this.store = ApiClient.store.collection(this.category);
            await ApiClient.get(`/${name}`);
        },

        onLogoutButtonClick() {
            location.href = "/logout";
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Public.less"></style>
