<template>
    <section class="login">
        <form v-on:submit="doReset($event)">
            <input
                type="text"
                name="email"
                ref="email"
                class="email"
                :placeholder="$t('email')"
            />
            <button type="submit" class="resetButton">
                {{ $t("resetPassword") }}
            </button>
            <router-link :to="{ name: 'loginreset' }" class="backToLogin">
                {{ $t("backToLogin") }}
            </router-link>
        </form>
    </section>
</template>

<script>
export default {
    methods: {
        doReset(event) {
            event.preventDefault();
            console.log("lallaa");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Login.less"></style>
