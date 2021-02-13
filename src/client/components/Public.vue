<template>
    <section class="public">
        <nav class="navigation" ref="navigation">
            <Button ref="lessons" name="lessons" @click="onNavButtonClick('lessons')">
                <school-icon />
            </Button>
            <Button ref="settings" name="settings" @click="onNavButtonClick('settings')">
                <cog-icon />
            </Button>
            <Button ref="logout" name="logout" @click="onNavButtonClick('logout')">
                <logout-icon />
            </Button>
        </nav>
        <main class="main"></main>
    </section>
</template>

<script>
import Button from "~client/components/Button";
export default {
    components: {
        Button
    },
    methods: {
        onNavButtonClick(name) {
            console.log(name);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Public.less"></style>
