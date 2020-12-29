<template>
    <section class="login">
        <form action="/login" v-on:submit="doLogin($event)">
            <input
                type="text"
                :placeholder="$t('email')"
                ref="email"
                class="email"
            />
            <input
                type="password"
                :placeholder="$t('password')"
                ref="password"
                class="password"
            />
            <div class="buttons">
                <button type="submit" class="loginButton">
                    {{ $t("login") }}
                </button>
                <router-link to="loginreset" class="forgetPassword">{{
                    $t("forgotPassword")
                }}</router-link>
            </div>
        </form>
    </section>
</template>

<script>
import { isEmail } from "validator";
import ApiClient from "~client/controllers/ApiClient";
import User from "~common/models/User";

export default {
    methods: {
        async doLogin(event) {
            event.preventDefault();

            const email = this.$refs.email.value;
            const password = this.$refs.password.value;

            if (!email || !isEmail(email)) {
                return this.$refs.email.classList.add("fail");
            }
            if (!password) return this.$refs.password.classList.add("fail");

            const result = await ApiClient.post("/login", { email, password });
            if (!result.success) {
                return console.log(result.error);
            }
            const userData = result.data.models[0];
            ApiClient.store.activeUser = Object.assign(new User(), userData);
            this.$router.push({ name: "public" });
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Login.less"></style>
