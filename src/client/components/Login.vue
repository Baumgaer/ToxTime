<template>
    <section class="login">
        <form action="/login" v-on:submit="doLogin($event)">
            <div class="welcomeBox">{{ $t("welcome", { to: global.process.environment.APP_NAME }) }}</div>
            <div ref="hintBox" class="fail hintBox"></div>
            <input
                type="text"
                :placeholder="$t('email')"
                ref="email"
                class="email"
                v-on:keydown="resetField('email')"
            />
            <input
                type="password"
                :placeholder="$t('password')"
                ref="password"
                class="password"
                v-on:keydown="resetField('password')"
            />
            <div class="buttons">
                <button type="submit" class="loginButton">
                    {{ $t("login") }}
                </button>
                <router-link
                    :to="{ name: 'loginreset' }"
                    class="forgotPassword"
                >
                    {{ $t("forgotPassword") }}
                </router-link>
            </div>
        </form>
    </section>
</template>

<script>
import { isEmail } from "validator";
import ApiClient from "~client/lib/ApiClient";
import i18n from "~client/lib/i18n";

export default {
    methods: {
        resetField(fieldName) {
            this.$refs[fieldName].classList.remove("fail");
            this.$refs.hintBox.innerText = "";
            this.$refs.hintBox.style.display = "none";
        },
        async doLogin(event) {
            event.preventDefault();

            const email = this.$refs.email.value;
            const password = this.$refs.password.value;

            if (!email || !isEmail(email)) {
                this.$refs.email.classList.add("fail");
                this.$refs.hintBox.innerText = i18n.t("emailIncorrect");
                this.$refs.hintBox.style.display = "block";
                return;
            }
            if (!password) {
                this.$refs.password.classList.add("fail");
                this.$refs.hintBox.innerText = i18n.t("passwordNotFilled");
                this.$refs.hintBox.style.display = "block";
                return;
            }

            const result = await ApiClient.post("/login", { email, password });
            if (!result.success) {
                if (result.error.name === "emailOrPasswordIncorrect") {
                    this.$refs.email.classList.add("fail");
                    this.$refs.password.classList.add("fail");
                    this.$refs.password.value = "";
                    this.$refs.hintBox.innerText = i18n.t(
                        "emailOrPasswordIncorrect"
                    );
                    this.$refs.hintBox.style.display = "block";
                }
                return;
            }
            const userData = result.data.models[0];
            window.location.href = userData.isAdmin ? "/admin" : "/public";
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Login.less"></style>
